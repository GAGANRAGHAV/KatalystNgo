# search_katalyst_doc.py

from server.app.db.db import pc

# Connect to the same index
index = pc.Index("katalyst-index")

# Sample query
query = "how to get addmission in katalyst program"

# Perform search
result = index.search(
    namespace="__default__",
    query={
        "top_k": 5,
        "inputs": {
            "text": query
        }
    },
    rerank={
        "model": "bge-reranker-v2-m3",
        "top_n": 1,
        "rank_fields": ["chunk_text"]
    },
    fields=["category", "chunk_text"]
)

# Display results
for hit in result["result"]["hits"]:
    print(f"Text: {hit['fields']['chunk_text']}")
    print(f"Score: {hit['_score']:.4f}")
    print("—" * 60)
