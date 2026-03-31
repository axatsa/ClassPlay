from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from apps.generator.models import TokenUsage
from apps.classes.models import ClassGroup
from apps.auth.models import User
from apps.generator.schemas import MathRequest, CrosswordRequest, QuizRequest, AssignmentRequest, JeopardyRequest
from apps.generator.services import check_token_quota, increment_token_usage, get_quota_info
from services.openai_service import generate_math_problems, generate_crossword_words, generate_quiz, generate_assignment, generate_jeopardy
from apps.auth.dependencies import get_current_user
from typing import Optional
from config import RATE_LIMIT_PER_HOUR
from rate_limiter import limiter

router = APIRouter(prefix="/api/generate", tags=["generator"])

def log_usage(db: Session, user_id: int, feature: str, tokens: int):
    usage = TokenUsage(user_id=user_id, feature_name=feature, tokens_total=tokens)
    db.add(usage)
    db.commit()

def get_class_context(db: Session, class_id: Optional[int]):
    if not class_id:
        return "", ""
    cls = db.query(ClassGroup).filter(ClassGroup.id == class_id).first()
    if cls:
        return cls.grade or "", cls.description or ""
    return "", ""

_rate_limit = f"{RATE_LIMIT_PER_HOUR}/hour"

@router.post("/math")
@limiter.limit(_rate_limit)
def gen_math(request: Request, req: MathRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_token_quota(user, db)
    grade, context = get_class_context(db, req.class_id)
    
    problems, tokens = generate_math_problems(req.topic, req.count, req.difficulty, grade, context, req.language)
    
    if problems is None:
        raise HTTPException(status_code=500, detail="AI Generation failed. Please try again.")

    if tokens > 0:
        log_usage(db, user.id, "math", tokens)
        increment_token_usage(user, tokens, db)
        
    return {"problems": problems or []}

@router.post("/crossword")
@limiter.limit(_rate_limit)
def gen_crossword(request: Request, req: CrosswordRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_token_quota(user, db)
    grade, context = get_class_context(db, req.class_id)
        
    words, tokens = generate_crossword_words(req.topic, req.word_count, req.language, grade, context)
    
    if words is None:
        raise HTTPException(status_code=500, detail="AI Generation failed. Please try again.")

    if tokens > 0:
        log_usage(db, user.id, "crossword", tokens)
        increment_token_usage(user, tokens, db)
        
    return {"words": words or []}

@router.post("/quiz")
@limiter.limit(_rate_limit)
def gen_quiz(request: Request, req: QuizRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_token_quota(user, db)
    grade, context = get_class_context(db, req.class_id)
    
    questions, tokens = generate_quiz(req.topic, req.count, grade, context, req.language)
    
    if questions is None:
        raise HTTPException(status_code=500, detail="AI Generation failed. Please try again.")

    if tokens > 0:
        log_usage(db, user.id, "quiz", tokens)
        increment_token_usage(user, tokens, db)
        
    return {"questions": questions or []}

@router.post("/jeopardy")
@limiter.limit(_rate_limit)
def gen_jeopardy(request: Request, req: JeopardyRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_token_quota(user, db)
    grade, context = get_class_context(db, req.class_id)
    
    data, tokens = generate_jeopardy(req.topic, grade, context, req.language)
    
    if data is None:
        raise HTTPException(status_code=500, detail="AI Generation failed. Please try again.")

    if tokens > 0:
        log_usage(db, user.id, "jeopardy", tokens)
        increment_token_usage(user, tokens, db)
        
    return data or {"categories": []}

@router.post("/assignment")
@limiter.limit(_rate_limit)
def gen_assignment(request: Request, req: AssignmentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    check_token_quota(user, db)
    grade, context = get_class_context(db, req.class_id)
    
    assignment, tokens = generate_assignment(req.subject, req.topic, req.count, grade, context, req.language)
    
    if assignment is None:
        raise HTTPException(status_code=500, detail="AI Generation failed. Please try again.")

    if tokens > 0:
        log_usage(db, user.id, "assignment", tokens)
        increment_token_usage(user, tokens, db)
        
    return {"result": assignment}

@router.get("/quota")
def get_my_quota(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_quota_info(user, db)
