from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from apps.auth.models import User
from apps.auth.dependencies import get_current_user
from services import gemini_service, openai_service
from config import GEMINI_API_KEYS_LIST, OPENAI_API_KEY
from apps.library.schemas import StorybookRequest, SavedResourceCreate, SavedResourceResponse, BookResponse
from apps.library.models import SavedResource, GeneratedBook
from apps.generator.services import check_token_quota, increment_token_usage, priority_guard, get_user_plan, get_org_gemini_key
from apps.generator.models import TokenUsage
from typing import List
import traceback
import logging
import json
import random

BOOK_DAILY_LIMITS = {"free": 2, "pro": 10, "school": 50}


def check_book_daily_limit(user: User, db: Session) -> None:
    plan = get_user_plan(user, db)
    limit = BOOK_DAILY_LIMITS.get(plan, 2)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    books_today = db.query(TokenUsage).filter(
        TokenUsage.user_id == user.id,
        TokenUsage.feature_name == "storybook",
        TokenUsage.created_at >= today_start,
    ).count()
    if books_today >= limit:
        raise HTTPException(status_code=429, detail={
            "error": "book_daily_limit",
            "message": f"Лимит книг на сегодня: {limit}. Сбрасывается завтра.",
            "books_today": books_today,
            "limit": limit,
            "upgrade_url": "/checkout" if plan == "free" else None,
        })

logger = logging.getLogger(__name__)

router = APIRouter()

library_router = APIRouter(prefix="/library", tags=["library"])

@library_router.post("/generate", response_model=BookResponse)
async def gen_storybook(
    req: StorybookRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await priority_guard(user, db)
    check_token_quota(user, db)
    check_book_daily_limit(user, db)

    result = None
    provider = None
    custom_key = get_org_gemini_key(user, db)

    # ── Попытка 1: Gemini ────────────────────────────────────────────────────
    if custom_key or GEMINI_API_KEYS_LIST:
        try:
            logger.info("Trying Gemini for storybook generation%s...", " (org custom key)" if custom_key else "")
            result = await gemini_service.generate_storybook(
                title=req.title,
                topic=req.topic,
                age_group=req.age_group,
                language=req.language,
                genre=req.genre,
                custom_api_key=custom_key,
            )
            if result:
                provider = "gemini"
                logger.info("Storybook generated successfully via Gemini")
        except Exception as e:
            logger.warning(f"Gemini failed: {e}. Falling back to OpenAI...")

    # ── Попытка 2: OpenAI fallback ───────────────────────────────────────────
    if result is None:
        if not OPENAI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Gemini quota exhausted and OPENAI_API_KEY is not configured. Please try again later.",
            )
        try:
            logger.info("Falling back to OpenAI (gpt-4o-mini + DALL-E 3)...")
            result = await openai_service.generate_storybook(
                title=req.title,
                topic=req.topic,
                age_group=req.age_group,
                language=req.language,
                genre=req.genre,
                openai_api_key=OPENAI_API_KEY,
            )
            if result:
                provider = "openai"
                logger.info("Storybook generated successfully via OpenAI fallback")
        except Exception as e:
            logger.error(f"OpenAI fallback also failed: {e}")
            traceback.print_exc()

    if result is None:
        raise HTTPException(
            status_code=503,
            detail="Book generation failed on all providers. Please try again later.",
        )

    emojis = ["📚","🧚","🦁","🐉","🚀","🌊","🌟","🦋","🐬","🏰"]
    book = GeneratedBook(
        user_id=user.id,
        title=result["title"],
        description=result.get("description"),
        age_group=result.get("age_group", req.age_group),
        genre=result.get("genre", req.genre),
        language=result.get("language", req.language),
        cover_emoji=random.choice(emojis),
        pages=json.dumps(result["pages"], ensure_ascii=False),
    )
    db.add(book)
    db.commit()
    db.refresh(book)

    # Log storybook usage (for daily limit tracking + token quota)
    pages_count = len(result.get("pages", []))
    image_penalty = pages_count * 500  # each image = separate Gemini request
    estimated_tokens = 2000 + image_penalty
    usage = TokenUsage(user_id=user.id, feature_name="storybook", tokens_total=estimated_tokens)
    db.add(usage)
    increment_token_usage(user, estimated_tokens, db)

    book.pages = result["pages"]
    return book

@library_router.get("/books")
def get_books(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    books = db.query(GeneratedBook)\
              .filter(GeneratedBook.user_id == user.id)\
              .order_by(GeneratedBook.created_at.desc())\
              .all()
    result = []
    for b in books:
        result.append({
            "id": b.id,
            "title": b.title,
            "description": b.description,
            "age_group": b.age_group,
            "genre": b.genre,
            "language": b.language,
            "cover_emoji": b.cover_emoji,
            "created_at": b.created_at.isoformat(),
            "page_count": len(json.loads(b.pages)) if b.pages else 0,
        })
    return result

@library_router.get("/books/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    book = db.query(GeneratedBook)\
             .filter(GeneratedBook.id == book_id,
                     GeneratedBook.user_id == user.id)\
             .first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    pages = json.loads(book.pages) if book.pages else []
    return {**book.__dict__, "pages": pages}

@library_router.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    book = db.query(GeneratedBook)\
             .filter(GeneratedBook.id == book_id,
                     GeneratedBook.user_id == user.id)\
             .first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Deleted"}


router.include_router(library_router)

resources_router = APIRouter(prefix="/resources", tags=["resources"])

@resources_router.get("/", response_model=List[SavedResourceResponse])
def get_resources(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(SavedResource).filter(SavedResource.user_id == user.id).order_by(SavedResource.created_at.desc()).all()

@resources_router.post("/", response_model=SavedResourceResponse)
def create_resource(res: SavedResourceCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_res = SavedResource(**res.dict(), user_id=user.id)
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

@resources_router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_res = db.query(SavedResource).filter(SavedResource.id == resource_id, SavedResource.user_id == user.id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(db_res)
    db.commit()
    return {"message": "Resource deleted"}

router.include_router(resources_router)
