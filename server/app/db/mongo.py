from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")  # or Atlas URI
db = client.katalyst_ngo
tickets = db.tickets
