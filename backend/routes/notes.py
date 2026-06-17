import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Note, Transcript, Job
from backend.auth_utils import decode_access_token
from backend.services.transcribe import get_youtube_transcript

router = APIRouter()
security = HTTPBearer()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> uuid.UUID:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return uuid.UUID(payload["sub"])


class YouTubeRequest(BaseModel):
    url: str
    title: str


@router.post("/youtube", status_code=201)
def submit_youtube(
    request: YouTubeRequest,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    try:
        raw_text = get_youtube_transcript(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    note = Note(
        user_id=user_id,
        title=request.title,
        source_type="youtube",
        source_url=request.url
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    transcript = Transcript(
        note_id=note.id,
        raw_text=raw_text
    )
    db.add(transcript)

    job = Job(
        note_id=note.id,
        status="transcribed"
    )
    db.add(job)
    db.commit()

    return {
        "note_id": str(note.id),
        "job_id": str(job.id),
        "status": "transcribed",
        "transcript_preview": raw_text[:200] + "..."
    }


@router.post("/upload", status_code=201)
def upload_audio(
    title: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    allowed_types = ["audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not supported")

    file_extension = file.filename.split(".")[-1]
    saved_filename = f"{uuid.uuid4()}.{file_extension}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(saved_path, "wb") as f:
        f.write(file.file.read())

    note = Note(
        user_id=user_id,
        title=title,
        source_type="audio",
        source_url=saved_filename
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    job = Job(note_id=note.id, status="pending")
    db.add(job)
    db.commit()

    return {
        "note_id": str(note.id),
        "job_id": str(job.id),
        "status": "pending",
        "message": "Audio uploaded, transcription will start shortly"
    }


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
            "created_at": str(note.created_at),
            "job_status": note.job.status if note.job else None
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
        "transcript": note.transcript.raw_text if note.transcript else None,
        "content": {
            "summary": note.content.summary if note.content else None,
            "key_concepts": note.content.key_concepts if note.content else None,
            "qna": note.content.qna if note.content else None,
            "action_items": note.content.action_items if note.content else None,
        },
        "job_status": note.job.status if note.job else None
    }


@router.get("/jobs/{job_id}")
def get_job_status(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": str(job.id),
        "status": job.status,
        "note_id": str(job.note_id)
    }