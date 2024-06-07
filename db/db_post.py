from fastapi import HTTPException

from db.models import DbPost
from router.schemas import PostBase
from sqlalchemy.orm.session import Session
from datetime import datetime


def create(db: Session, request: PostBase):
    db_post = DbPost(
        image_url=request.image_url,
        image_url_type=request.image_url_type,
        caption=request.caption,
        timestamp=datetime.now(),
        user_id=request.creator_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_posts(db: Session):
    return db.query(DbPost).all()


def delete(db: Session, id: int, user_id: int):
    post = db.query(DbPost).filter(DbPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Only post creator can delete post")
    db.delete(post)
    db.commit()
    return "ok"
