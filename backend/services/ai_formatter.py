import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def format_notes(transcript: str, title: str) -> dict:
    prompt = f"""You are a study notes assistant. Give the transcript below, generate study notes.

Title: {title}

Transcript:
{transcript[:8000]}

Respond with ONLY a JSON object in this exact format, no other text:
{{
    "summary": "3-5 sentence summary of the main topic",
    "key_concepts": [
    {{"term": "concept name", "definition": "clear explanation"}}
    ],
    "qna": [
    {{"question": "study question", "answer": "answer"}}
    ],
    "action_items": [
    "thing to review or practice"
    ]
}}"""
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text
    clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(clean)