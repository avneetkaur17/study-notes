import uuid
from backend.celery_app import celery
from backend.database import SessionLocal
from backend.models import Note, Transcript, Job
from youtube_transcript_api import YouTubeTranscriptApi
import re

def get_video_id(url: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

@celery.task(bind=True)
def process_youtube(self, note_id: str, url: str):
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.note_id == uuid.UUID(note_id)).first()
        job.status = "processing"
        db.commit()

        # Pull transcript
        video_id = get_video_id(url)
        fetcher = YouTubeTranscriptApi()
        transcript = fetcher.fetch(video_id)
        full_text = " ".join([entry.text for entry in transcript])

        # Save transcript
        transcript = db.query(Transcript).filter(
            Transcript.note_id == uuid.UUID(note_id)
        ).first()
        if transcript:
            transcript.raw_text = full_text
        else:
            transcript = Transcript(note_id=uuid.UUID(note_id), raw_text=full_text)
            db.add(transcript)

        job.status = "transcribed"
        db.commit()
        return {"status": "transcribed", "note_id": note_id}
    
    except Exception as e:
        job = db.query(Job).filter(Job.note_id == uuid.UUID(note_id)).first()
        if job:
            job.status = "failed"
            db.commit()
        raise e
    finally:
        db.close()