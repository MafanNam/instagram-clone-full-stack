from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from db import db_post
from router.schemas import PostDisplay, PostBase

router = APIRouter(
    prefix="/post",
    tags=["post"],
    responses={404: {"description": "Not found"}},
)

image_url_types = ['absolute', 'relative']


@router.post("", response_model=PostDisplay)
def create_post(request: PostBase, db: Session = Depends(get_db)):
    if request.image_url_type not in image_url_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Parameter image_url_type must be 'absolute' or 'relative'"
        )
    return db_post.create(db, request)


@router.get("", response_model=list[PostDisplay])
def get_posts(db: Session = Depends(get_db)):
    return db_post.get_posts(db)