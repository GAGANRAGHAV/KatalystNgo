from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb+srv://gaganraghav143:brpdnn5YK9jNAYPy@cluster0.nlhcykc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = AsyncIOMotorClient(MONGO_URI)
db = client["katalyst_db"]
logs_collection = db["query_logs"]
