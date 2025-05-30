from pathlib import Path
from dotenv import load_dotenv
import os
from pinecone import Pinecone, ServerlessSpec

# ✅ Point to the .env file in the server root directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# ✅ Debug print (remove later)
print("🔑 PINECONE_API_KEY from .env:", os.getenv("PINECONE_API_KEY"))

# ✅ Now use the API key
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))



# # PINECONE_API_KEY="pcsk_2yK9u1_Te9BFicWo19Lpus4ao3yPHrjHu41cxutpUMot65pNQRA3CXGCD1GHBEAK1ieucx"

# from pinecone import Pinecone, ServerlessSpec
# from dotenv import load_dotenv
# import os

# load_dotenv()

# pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))