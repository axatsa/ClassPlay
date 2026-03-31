from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from apps.auth.models import User
from apps.auth.dependencies import get_current_user
from services.gemini_service import generate_storybook
from config import GEMINI_API_KEY
from apps.library.schemas import StorybookRequest, SavedResourceCreate, SavedResourceResponse
from apps.library.models import SavedResource
from typing import List
import traceback

router = APIRouter()

library_router = APIRouter(prefix="/api/library", tags=["library"])

@library_router.post("/generate")
async def gen_storybook(
    req: StorybookRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured on the server. Please add it to your .env file.",
        )

    try:
        result = await generate_storybook(
            title=req.title,
            topic=req.topic,
            age_group=req.age_group,
            language=req.language,
            genre=req.genre,
            gemini_api_key=GEMINI_API_KEY,
        )

        if result is None:
            raise HTTPException(
                status_code=500,
                detail="Storybook generation failed on service level.",
            )

        return {"book": result}

    except Exception as e:
        print(f"CRITICAL ERROR in gen_storybook: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Storybook generation failed: {str(e)}",
        )

router.include_router(library_router)

resources_router = APIRouter(prefix="/api/resources", tags=["resources"])

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
