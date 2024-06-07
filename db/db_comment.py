from datetime import datetime

from sqlalchemy.orm import Session

from db.models import DbComment
from router.schemas import CommentBase


def create(db: Session, request: CommentBase):
    db_comment = DbComment(
        text=request.text,
        username=request.username,
        timestamp=datetime.now(),
        post_id=request.post_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_all(db: Session, post_id: int):
    return db.query(DbComment).filter(DbComment.post_id == post_id).all()
