from typing import Optional
from fastapi import Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import ResearchLensException, PermissionDeniedException
from app.models.models import User
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials or not credentials.credentials:
        raise ResearchLensException(
            message="Missing or invalid authentication token. Please sign in.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        raise ResearchLensException(
            message="Invalid or expired authentication session. Please sign in again.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    user_id = payload.get("sub") or payload.get("id")
    email = payload.get("email")

    if not user_id and not email:
        raise ResearchLensException(
            message="Malformed authentication payload.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    # Query user from DB
    user = None
    if user_id:
        user = db.query(User).filter(User.id == str(user_id)).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()

    # If Supabase user not yet synced in local DB, auto-provision profile
    if not user and email:
        user = User(
            id=str(user_id) if user_id else None,
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name", email.split("@")[0]),
            institution=payload.get("user_metadata", {}).get("institution", "Academic Institution"),
            role="researcher"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise ResearchLensException(
            message="User record associated with this token was not found.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    return user
