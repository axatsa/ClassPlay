"""
Shared rate limiter instance.
Отдельный модуль чтобы избежать circular imports между main.py и routes/*.py
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def get_user_id_or_ip(request: Request) -> str:
    """Rate limit key: token prefix if authenticated, else IP address."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return f"user:{auth[7:57]}"
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_id_or_ip)
