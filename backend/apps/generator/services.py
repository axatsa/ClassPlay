from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from apps.auth.models import User
from config import DEFAULT_TOKEN_LIMIT

def reset_quota_if_needed(user: User, db: Session) -> None:
    now = datetime.utcnow()
    if user.tokens_reset_at is None or (now - user.tokens_reset_at) > timedelta(days=30):
        user.tokens_used_this_month = 0
        user.tokens_reset_at = now
        db.commit()

def check_token_quota(user: User, db: Session) -> None:
    if user.role == "super_admin":
        return

    reset_quota_if_needed(user, db)

    if user.tokens_limit is None:
        user.tokens_limit = DEFAULT_TOKEN_LIMIT
        db.commit()

    if user.tokens_limit == -1:
        return

    if user.tokens_used_this_month >= user.tokens_limit:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "token_quota_exceeded",
                "message": "Monthly token limit reached. Please contact admin to increase your limit.",
                "tokens_used": user.tokens_used_this_month,
                "tokens_limit": user.tokens_limit,
            }
        )

def increment_token_usage(user: User, tokens_used: int, db: Session) -> None:
    if user.role == "super_admin":
        return

    if tokens_used and tokens_used > 0:
        user.tokens_used_this_month = (user.tokens_used_this_month or 0) + tokens_used
        db.commit()

def get_quota_info(user: User, db: Session) -> dict:
    reset_quota_if_needed(user, db)
    return {
        "tokens_used": user.tokens_used_this_month or 0,
        "tokens_limit": user.tokens_limit if user.tokens_limit is not None else DEFAULT_TOKEN_LIMIT,
        "unlimited": user.tokens_limit == -1,
        "reset_at": user.tokens_reset_at.isoformat() if user.tokens_reset_at else None,
    }
