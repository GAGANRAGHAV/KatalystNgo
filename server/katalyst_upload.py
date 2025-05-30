# upload_katalyst_doc_structured.py

from docx import Document
from server.app.db.db import pc

# Function to group paragraphs into logical chunks
def extract_grouped_chunks(path):
    doc = Document(path)
    chunks = []
    buffer = ""

    def is_heading_or_question(text):
        return (
            text.endswith("?") or
            text.istitle() or
            (text.isupper() and len(text) > 10) or
            text.lower().startswith("what") or
            text.lower().startswith("how") or
            text.lower().startswith("when") or
            text.lower().startswith("where") or
            text.lower().startswith("who") or
            text.lower().startswith("about") or
            text.lower().startswith("enrollment")
        )

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        if is_heading_or_question(text) and buffer:
            chunks.append(buffer.strip())
            buffer = ""
        buffer += text + "\n"
    if buffer:
        chunks.append(buffer.strip())
    return chunks

# Step 1: Extract grouped chunks
paragraphs = extract_grouped_chunks("Katalyst_QA_Form.docx")

# Step 2: Format for Pinecone upload
records = [
    {
        "_id": f"katalyst_chunk_{i+1}",
        "chunk_text": chunk,
        "category": "katalyst_doc"
    }
    for i, chunk in enumerate(paragraphs)
]

# Step 3: Create or get index
index_name = "katalyst-index"
if not pc.has_index(index_name):
    pc.create_index_for_model(
        name=index_name,
        cloud="aws",
        region="us-east-1",
        embed={
            "model": "llama-text-embed-v2",
            "field_map": {"text": "chunk_text"}
        }
    )

# Step 4: Upload
index = pc.Index(index_name)
index.upsert_records(namespace="", records=records)

print(f"Uploaded {len(records)} structured chunks to Pinecone.")
