from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from apps.classes.models import ClassGroup
from apps.classes.schemas import ClassCreate, ClassResponse
from apps.auth.dependencies import get_current_user
from apps.auth.models import User

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("/", response_model=List[ClassResponse])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "super_admin":
        return db.query(ClassGroup).all()
    return db.query(ClassGroup).filter(ClassGroup.teacher_id == current_user.id).all()


@router.post("/", response_model=ClassResponse)
def create_class(
    cls: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_class = ClassGroup(
        **cls.model_dump(),
        teacher_id=current_user.id,
        organization_id=current_user.organization_id,
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    cls: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_class = db.query(ClassGroup).filter(ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    if db_class.teacher_id != current_user.id and current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this class")

    for key, value in cls.model_dump().items():
        setattr(db_class, key, value)

    db.commit()
    db.refresh(db_class)
    return db_class


@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_class = db.query(ClassGroup).filter(ClassGroup.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    if db_class.teacher_id != current_user.id and current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this class")

    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted"}
