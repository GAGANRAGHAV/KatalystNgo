# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
#from server.app.db.db import pc
from app.db.db import pc
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional
from app.db.mongo import tickets
from datetime import datetime
from fastapi import Body
from bson.objectid import ObjectId
from fastapi import HTTPException
from fastapi import Body
import re
from fastapi import HTTPException

app = FastAPI()

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pinecone index
index = pc.Index("katalyst-index")

# Request body model
class Query(BaseModel):
    question: str
    user_name: Optional[str] = "anonymous"
    contact: Optional[str] = None
    priority: Optional[str] = "normal"

@app.post("/chat")
def search_katalyst_doc(query: Query):
    # Try to detect a ticket ID (24 hex chars) in the question text
    ticket_id_match = re.search(r"\b[0-9a-fA-F]{24}\b", query.question)
    if ticket_id_match:
        ticket_id = ticket_id_match.group(0)
        try:
            ticket = tickets.find_one({"_id": ObjectId(ticket_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ticket ID format")

        if ticket:
            return {
                "answer": (
                    f"Ticket ID: {ticket_id}\n"
                    f"Status: {ticket.get('status', 'Unknown')}\n"
                    f"Priority: {ticket.get('priority', 'N/A')}\n"
                    f"Created At: {ticket.get('created_at')}\n"
                    f"Response: {ticket.get('response') or 'Not yet responded'}"
                )
            }
        else:
            return {"answer": "Sorry, I could not find any ticket with that ID."}

    # If no ticket ID in question, proceed with your existing search logic
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
    if not hits or hits[0]["_score"] < 0.5:
        # Create ticket
        ticket = {
            "user_name": query.user_name,
            "contact": query.contact,
            "query": query.question,
            "priority": query.priority,
            "status": "Open",
            "created_at": datetime.utcnow(),
            "chat_transcript": [query.question],
            "response": None
        }
        inserted = tickets.insert_one(ticket)
        return {
            "answer": "Sorry, I couldn't find anything relevant. Your query has been escalated.",
            "ticket_id": str(inserted.inserted_id)
        }

    top_hit = hits[0]
    return {
        "answer": top_hit["fields"]["chunk_text"],
        "score": top_hit["_score"]
    }

# @app.post("/chat")
# def search_katalyst_doc(query: Query):
#     result = index.search(
#         namespace="__default__",
#         query={
#             "top_k": 5,
#             "inputs": {
#                 "text": query.question
#             }
#         },
#         rerank={
#             "model": "bge-reranker-v2-m3",
#             "top_n": 1,
#             "rank_fields": ["chunk_text"]
#         },
#         fields=["category", "chunk_text"]
#     )

#     hits = result["result"]["hits"]
#     if not hits or hits[0]["_score"] < 0.5:
#         # Create ticket
#         ticket = {
#             "user_name": query.user_name,
#             "contact": query.contact,
#             "query": query.question,
#             "priority": query.priority,
#             "status": "Open",
#             "created_at": datetime.utcnow(),
#             "chat_transcript": [query.question],
#             "response": None
#         }
#         inserted = tickets.insert_one(ticket)
#         return {
#             "answer": "Sorry, I couldn't find anything relevant. Your query has been escalated.",
#             "ticket_id": str(inserted.inserted_id)
#         }

#     top_hit = hits[0]
#     return {
#         "answer": top_hit["fields"]["chunk_text"],
#         "score": top_hit["_score"]
#     }



@app.get("/tickets/{ticket_id}")
def get_ticket_status(ticket_id: str):
    ticket = tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket["_id"] = str(ticket["_id"]) 
    return {
        "ticket_id": ticket["_id"],
        "status": ticket.get("status", "Unknown"),
        "response": ticket.get("response"),
        "created_at": ticket.get("created_at"),
        "resolved_at": ticket.get("resolved_at"),
        "priority": ticket.get("priority"),
        "user_name": ticket.get("user_name"),
        "contact": ticket.get("contact"),
        "query": ticket.get("query"),
    }


@app.get("/tickets")
def get_all_tickets():
    all_tickets = []
    for t in tickets.find():
        t["_id"] = str(t["_id"])  # Convert ObjectId to string
        all_tickets.append(t)
    return all_tickets


@app.post("/tickets/{ticket_id}/resolve")
def resolve_ticket(ticket_id: str, response: str = Body(...)):
    updated = tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": "Resolved", "response": response, "resolved_at": datetime.utcnow()}}
    )
    if updated.modified_count == 0:
        return {"error": "Ticket not found"}
    return {"message": "Ticket resolved"}


@app.post("/tickets/{ticket_id}/update-status")
def update_ticket_status(ticket_id: str, status: str = Body(...)):
    valid_statuses = {"Open", "In Progress", "Resolved", "Closed"}
    if status not in valid_statuses:
        return {"error": f"Invalid status. Must be one of {valid_statuses}"}
    
    # Strip whitespace/newlines from ticket_id if any
    ticket_id = ticket_id.strip()

    updated = tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": status}}
    )
    if updated.modified_count == 0:
        return {"error": "Ticket not found or status unchanged"}
    
    return {"message": f"Ticket status updated to '{status}'"}


@app.post("/tickets/{ticket_id}/start-work")
def start_work_on_ticket(ticket_id: str):
    ticket_id = ticket_id.strip()

    updated = tickets.update_one(
        {"_id": ObjectId(ticket_id), "status": "Open"},
        {"$set": {"status": "In Progress"}}
    )
    if updated.modified_count == 0:
        return {"error": "Ticket not found or already in progress or resolved"}
    
    return {"message": "Ticket status updated to 'In Progress'"}