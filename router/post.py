import random
import shutil
import string

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from auth.oauth2 import get_current_user
from db.database import get_db
from db import db_post
from router.schemas import PostDisplay, PostBase, UserAuth

router = APIRouter(
    prefix="/post",
    tags=["post"],
    responses={404: {"description": "Not found"}},
)

image_url_types = ['absolute', 'relative']


@router.post("", response_model=PostDisplay)
def create_post(request: PostBase, db: Session = Depends(get_db), current_user: UserAuth = Depends(get_current_user)):
    if request.image_url_type not in image_url_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Parameter image_url_type must be 'absolute' or 'relative'"
        )
    return db_post.create(db, request)


@router.get("", response_model=list[PostDisplay])
def get_posts(db: Session = Depends(get_db)):
    return db_post.get_posts(db)


@router.post("/image")
def upload_image(image: UploadFile = File(...), current_user: UserAuth = Depends(get_current_user)):
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    new_filename = f"_{rand_str}."
    filename = new_filename.join(image.filename.rsplit('.', 1))
    path = f"images/{filename}"

    with open(path, "w+b") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return {"filename": path}


@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db), current_user: UserAuth = Depends(get_current_user)):
    return db_post.delete(db, id, current_user.id)

