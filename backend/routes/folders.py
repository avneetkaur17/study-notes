import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Folder
from backend.auth_utils import decode_access_token

router = APIRouter()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> uuid.UUID:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return uuid.UUID(payload["sub"])

class FolderRequest(BaseModel):
    name: str

@router.get("/")
def get_folder(db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    folders = db.query(Folder).filter(Folder.user_id == user_id).all()
    return [{"id": str(f.id), "name": f.name, "created_at": str(f.created_at)} for f in folders]

@router.post("/", status_code=201)
def create_folder(request: FolderRequest, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    folder = Folder(user_id=user_id, name=request.name)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return {"id": str(folder.id), "name": folder.name}