PINECONE_API_KEY="pcsk_2yK9u1_Te9BFicWo19Lpus4ao3yPHrjHu41cxutpUMot65pNQRA3CXGCD1GHBEAK1ieucx"

from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API"))