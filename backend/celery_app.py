from celery import Celery

celery = Celery(
    "study_notes",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["backend.tasks"]
)

celery.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)