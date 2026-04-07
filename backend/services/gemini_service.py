"""
Gemini Storybook Service
========================
Text  : gemini-2.0-flash        → high-quality story, 10 pages × 60-70 words
Images: gemini-2.0-flash-exp    → native image generation (fallback friendly)
SDK   : google-genai (pip install google-genai)
"""

from google import genai
from google.genai import types as genai_types

import asyncio
import base64
import json
import logging
import re
import traceback
from typing import Optional
import threading

logger = logging.getLogger(__name__)

from config import GEMINI_API_KEYS_LIST

class GeminiKeyManager:
    def __init__(self, keys: list[str]):
        self.keys = keys
        self.current_index = 0
        self.lock = threading.Lock()

    def get_next_key(self) -> str:
        if not self.keys:
            return ""
        with self.lock:
            key = self.keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.keys)
            return key

key_manager = GeminiKeyManager(GEMINI_API_KEYS_LIST)

# ─── Image models to try in order ────────────────────────────────────────────
# gemini-2.5-flash-image is newest; fall back to gemini-2.0-flash-exp if unavailable
IMAGE_MODELS = [
    "gemini-2.0-flash-exp",        # widely available, good quality
    "gemini-2.5-flash-image",      # newest (may not be on all API tiers)
]

# ─── Prompts ─────────────────────────────────────────────────────────────────

STORY_SYSTEM = (
    "You are an award-winning children's storybook author. "
    "You write warm, engaging, imaginative stories with a natural narrative arc. "
    "Output ONLY valid JSON, no markdown fences, no extra text."
)


def _story_prompt(title, topic, age_group, language, genre):
    title_instruction = f'Title: "{title}"' if title else 'Generate a creative and catchy title for this story.'
    return f"""Write a children's {genre} storybook in {language}.

{title_instruction}
Topic / educational theme: {topic}
Target age: {age_group} years old
Number of story pages: 10
Words per page: exactly 60-70 words (count carefully!)

Narrative requirements:
- Page 1: introduce characters and setting
- Pages 2-8: story unfolds with a small challenge or adventure
- Page 9: problem is resolved
- Page 10: warm, hopeful ending that reinforces the topic/theme
- Language: {language} (all story text must be in {language})
- Style: simple sentences, vivid imagery, child-friendly vocabulary

For each page also include an illustration_prompt in English (max 25 words):
  Format: "Children's storybook illustration, [scene description], watercolor style, soft warm colors, detailed."

Return ONLY this JSON (no markdown, no extra text):
{{
  "title": "{title if title else 'Generated Title'}",
  "description": "One engaging summary sentence in {language}",
  "age_group": "{age_group}",
  "genre": "{genre}",
  "language": "{language}",
  "pages": [
    {{
      "page_number": 1,
      "text": "Story text in {language}, exactly 60-70 words.",
      "illustration_prompt": "Children's storybook illustration, [scene], watercolor style, soft warm colors, detailed."
    }}
  ]
}}"""


def _image_prompt(illustration_prompt: str, age_group: str) -> str:
    """Build a high-quality image generation prompt."""
    return (
        f"{illustration_prompt} "
        f"Children's storybook, ages {age_group}. "
        "Soft watercolor illustration, warm pastel palette, "
        "professional children's book art, highly detailed, "
        "no text, no words, no letters."
    )


# ─── Main generator ───────────────────────────────────────────────────────────

async def generate_storybook(
    title: Optional[str] = "",
    topic: str = "",
    age_group: str = "7-10",
    language: str = "Russian",
    genre: str = "fairy tale",
) -> Optional[dict]:
    """
    Two-step generation:
      1. Generate 10-page story text with gemini-2.0-flash
      2. Generate 10 illustrations in parallel (tries gemini-2.0-flash-exp first)
    Returns dict with pages list, each page has image_base64 (or None).
    """
    if not key_manager.keys:
        logger.error("No Gemini API keys configured")
        return None

    max_retries = len(key_manager.keys)
    story_data = None

    # ── STEP 1: Generate story text (with retries) ───────────────────────
    for attempt in range(max_retries):
        api_key = key_manager.get_next_key()
        client = genai.Client(api_key=api_key)
        
        logger.info(f"Generating story text with gemini-2.0-flash (attempt {attempt + 1}/{max_retries})...")
        try:
            story_response = await asyncio.to_thread(
                client.models.generate_content,
                model="gemini-2.0-flash",
                contents=_story_prompt(title, topic, age_group, language, genre),
                config=genai_types.GenerateContentConfig(
                    system_instruction=STORY_SYSTEM,
                    temperature=0.9,
                    max_output_tokens=8192,
                ),
            )
            raw = story_response.text.strip()
            
            # Parse story JSON
            story_data = _parse_json(raw)
            if not story_data or "pages" not in story_data:
                logger.error(f"Could not parse story JSON. Raw output was likely not JSON.")
                story_data = None
                continue # Try another key or just fail? Usually JSON failure is not a 429, but could retry just in case.
                
            break # Success!
        except Exception as e:
            error_msg = str(e).lower()
            if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg or "too many requests" in error_msg:
                logger.warning(f"Rate limit exceeded (429) on attempt {attempt + 1}. Retrying with next key...")
                continue
            else:
                logger.error(f"Story generation failed on attempt {attempt + 1}: {e}")
                # Don't break here, some other random error might be resolved by another key or a subsequent retry
                continue

    if not story_data:
        logger.error("Story generation failed after all retries.")
        return None

    logger.info(f"Story parsed: {len(story_data['pages'])} pages")

    # ── STEP 2: Generate illustrations in parallel ───────────────────────
    logger.info(f"Generating 10 images in parallel...")
    tasks = []
    for i, page in enumerate(story_data["pages"]):
        prompt = _image_prompt(
            page.get("illustration_prompt", f"Scene from page {page['page_number']}"),
            age_group,
        )
        tasks.append(_generate_image(prompt))

    # Run all image generations concurrently
    image_results = await asyncio.gather(*tasks)

    for i, img_b64 in enumerate(image_results):
        story_data["pages"][i]["image_base64"] = img_b64

    return story_data


async def _generate_image(prompt: str) -> Optional[str]:
    """Try each image model in order, with key rotation on 429 limit errors. Returns base64 PNG string or None."""
    max_retries = max(1, len(key_manager.keys))
    
    for attempt in range(max_retries):
        api_key = key_manager.get_next_key()
        client = genai.Client(api_key=api_key)
        
        for model_name in IMAGE_MODELS:
            try:
                logger.info(f"Attempting image generation with {model_name} (key attempt {attempt + 1})...")
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        temperature=1.0,
                    ),
                )
                
                if not response.candidates:
                    logger.warning(f"No candidates returned from {model_name}")
                    continue
                    
                for part in response.candidates[0].content.parts:
                    if part.inline_data:
                        raw = part.inline_data.data
                        mime = part.inline_data.mime_type
                        logger.info(f"Image generated with {model_name} (MIME: {mime})")
                        if isinstance(raw, bytes):
                            return base64.b64encode(raw).decode("utf-8")
                        return str(raw) # already base64
            except Exception as e:
                error_msg = str(e).lower()
                if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg or "too many requests" in error_msg:
                    logger.warning(f"Rate limit exceeded (429) for {model_name}. Breaking inner loop to try next key.")
                    break # Break inner model loop, try outer loop (next key)
                else:
                    logger.warning(f"Model {model_name} failed: {e}")
                    # traceback.print_exc()

    logger.error("All image generation keys and models failed — returning None")
    return None


def _parse_json(text: str) -> Optional[dict]:
    """Try multiple strategies to extract valid JSON from model output."""
    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # 2. Markdown code block
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            pass
    # 3. First JSON object
    m = re.search(r"(\{.*\})", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            pass
    return None
