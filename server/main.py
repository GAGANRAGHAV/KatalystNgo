# backend/main.py

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from app.db import pc
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.mongo import logs_collection

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pinecone index
index = pc.Index("katalyst-index")

# Request body model for /chat
class Query(BaseModel):
    question: str

# Request body model for /log_low_score_query
class LogEntry(BaseModel):
    question: str
    email: str
    score: float

@app.post("/chat")
async def search_katalyst_doc(query: Query, request: Request):
    result = index.search(
        namespace="__default__",
        query={
            "top_k": 5,
            "inputs": {
                "text": query.question
            }
        },
        rerank={
            "model": "bge-reranker-v2-m3",
            "top_n": 1,
            "rank_fields": ["chunk_text"]
        },
        fields=["category", "chunk_text"]
    )

    hits = result["result"]["hits"]
    if not hits:
        return {"message": "Sorry, I couldn't find anything relevant."}

    top_hit = hits[0]
    score = top_hit["_score"]
    answer = top_hit["fields"]["chunk_text"]

    SIMILARITY_THRESHOLD = 0.1

    if score < SIMILARITY_THRESHOLD:
        return {
            "answer": "I'm sorry, I couldn't find a relevant answer to your question.",
            "message": "Your query has been logged. We'll get back to you soon.",
            "should_log": True,
            "score": score,
            "question": query.question
        }

    return {
        "answer": answer,
        "score": score,
        "should_log": False
    }

@app.post("/log_low_score_query")
async def log_low_score_query(entry: LogEntry):
    log_entry = {
        "question": entry.question,
        "email": entry.email,
        "score": entry.score,
        "timestamp": datetime.utcnow()
    }
    await logs_collection.insert_one(log_entry)
    return {"message": "Your query has been logged. We'll get back to you soon."}


# // fetch all logs
@app.get("/logs")
async def get_logs():
    logs = []
    async for log in logs_collection.find():
        logs.append({
            "question": log["question"],
            "email": log.get("email", "N/A"),  # Use a fallback if key is missing
            "score": log["score"],
            "timestamp": log["timestamp"]
        })
    return {"logs": logs}

@app.delete("/log")
async def delete_log(email: str, question: str):
    result = await logs_collection.delete_one({"email": email, "question": question})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"message": "Log deleted"}

