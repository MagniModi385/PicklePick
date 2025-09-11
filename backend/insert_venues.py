# insert_venues.py

from pymongo import MongoClient
from datetime import datetime
from decouple import config

# Fetch MongoDB URI from .env or set it directly here for one-off script
MONGODB_URI = config('MONGODB_URI', default='mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER/pickleball?retryWrites=true&w=majority')

client = MongoClient(MONGODB_URI)
db = client['pickleball']
venues_collection = db['venues']

# List of venue dictionaries you want to insert
venues = [
    {
        "name": "",
        "image_url": "",
        "hudle_url": "",
        "location": "",
        "description": "Contact Venue : ",
        "created_at": datetime.now()
    }
]
result = venues_collection.insert_many(venues)
print(f"Inserted venue _ids: {result.inserted_ids}")
