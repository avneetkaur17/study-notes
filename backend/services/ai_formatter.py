import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def format_notes(transcript: str, title: str) -> dict:
    prompt = f"""You are an expert study creator. A student is using this instead of watching a video - your notes must be so thorough and clear that they never need to watch it.

Title: {title}

Transcript:
{transcript[:12000]}

Generate a comprehensive study guide. Respond with ONLY a JSON object in this exact format, no other text:
{{
    "summary" : "A detailed 6-8 sentence overview of everything covered. Include the main argument, key themes, and why this topic matters.",

    "key_concepts" : [
        {{
            "term": "concept name",
            "definition": "Clear, thorough explanation in plain English. Include how it works, why it matters, and a real-world analogy if helpful.",
            "example": "A concrete example that makes this concept click"
        }}
    ],

    "detailed_notes": [
        {{
            "topic": "section or topic heading",
            "content": "Thorough notes on this section. Write as if explaining to a smart friend who hasn't seen the video. Include all important details, nuances, and context.",
            "bullet_points": ["key point 1", "key point 2", "key point 3"]
        }}
    ],

    "quiz_questions": [
        {{
            "question": "clear exam-style question",
            "options": {{
                "A": "First option",
                "B": "Second option",
                "C": "Third option",
                "D": "Fourth option"
            }},
            "correct": "A",
            "explanation": "Why this answer is correct and why the others are wrong"
        }}
    ],

    "flashcards": [
        {{
            "front": "Term or question",
            "back": "Definition or answer - concise but complete"
        }}
    ],

    "action_items": [
        "Specific thing to review, practice, or look up to deepen understanding"
    ],

    "tldr": "One sentence: the single most important takeaway from this entire video"
}}

Requirements:
- Generate at least 8 key concepts
- Generate at least 5 detailed note sections
- Generate at least 15 quiz questions with 4 realistic options each. Make wrong options plausible, not obvious. Include difficulty: easy, medium, or hard for each question.
- Generate at least 15 flashcards
-Be thorough - a student should be able to ace an exam using only these notes"""
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text
    clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(clean)