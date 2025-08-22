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
        "name": "Vinayak Sports Arena",
        "image_url": "https://media.hudle.in/venues/352903c9-fc6e-4a39-ae33-aba0028012fa/photo/18bc531e385b268ff5f21a65ac6d478677768509",
        "hudle_url": "https://hudle.in/venues/dinkers-pickleball-academy-club/167103",
        "location": "Shilaj, Ahmedabad",
        "description": "Contact Venue : 83473 88882",
        "created_at": datetime.now()
    }
]
result = venues_collection.insert_many(venues)
print(f"Inserted venue _ids: {result.inserted_ids}")
