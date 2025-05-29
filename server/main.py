# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from app.db import pc
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pinecone index
index = pc.Index("katalyst-index")

# Request body model
class Query(BaseModel):
    question: str

@app.post("/chat")
def search_katalyst_doc(query: Query):
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
        return {"answer": "Sorry, I couldn't find anything relevant."}

    top_hit = hits[0]
    return {
        "answer": top_hit["fields"]["chunk_text"],
        "score": top_hit["_score"]
    }
