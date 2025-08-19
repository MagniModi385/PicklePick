# backend/core/mongo_connection.py
from pymongo import MongoClient
from decouple import config

# Read the MongoDB connection string from environment variables
MONGODB_URI = config('MONGODB_URI')

# Establish the MongoDB connection
client = MongoClient(MONGODB_URI)

# Use the pickleball database on your Atlas cluster
mongo_db = client['pickleball']
