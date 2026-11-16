from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import ResearchLensException, DuplicateResourceException
from app.models.models import User, ResearchProject
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise DuplicateResourceException(f"User with email '{payload.email}' already exists.")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        institution=payload.institution,
        role="researcher"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create default research project for new user
    default_project = ResearchProject(
        user_id=user.id,
        title="Efficiency in Transformer & Multimodal Architectures",
        description="Core research workspace investigating parameter-efficient fine-tuning and inference optimizations.",
        research_field="Computer Science / AI"
    )
    db.add(default_project)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise ResearchLensException(
            message="Invalid credentials. Please verify your email and password.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
