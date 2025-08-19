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
        "name": "Topspin Pickleball",
        "image_url": "https://media.hudle.in/venues/300e1ac8-3eae-44d1-a350-4fcfc4659f9d/photo/f04710c87e1c4b105ae03a2a74ffc75b947a067d",
        "hudle_url": "https://hudle.in/venues/topspin-pickleball-south-bopal/939291",
        "location": "South Bopal, Ahmedabad",
        "description": "Postive reviews",
        "created_at": datetime.now()
    }
    # Add more venues as needed
]

result = venues_collection.insert_many(venues)
print(f"Inserted venue _ids: {result.inserted_ids}")
