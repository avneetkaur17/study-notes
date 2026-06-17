from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Note
from backend.auth_utils import decode_access_token
import uuid

router = APIRouter()
security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> uuid.UUID:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return uuid.UUID(payload["sub"])


@router.get("/")
def get_notes(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    notes = db.query(Note).filter(Note.user_id == user_id).all()
    return [
        {
            "id": str(note.id),
            "title": note.title,
            "source_type": note.source_type,
            "created_at": str(note.created_at)
        }
        for note in notes
    ]


@router.get("/{note_id}")
def get_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == user_id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return {
        "id": str(note.id),
        "title": note.title,
        "source_type": note.source_type,
        "source_url": note.source_url,
        "created_at": str(note.created_at),
        "content": {
            "summary": note.content.summary if note.content else None,
            "key_concepts": note.content.key_concepts if note.content else None,
            "qna": note.content.qna if note.content else None,
            "action_items": note.content.action_items if note.content else None,
        },
        "job_status": note.job.status if note.job else None
    }