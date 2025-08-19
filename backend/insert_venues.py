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
        "name": "Pickle Play",
        "image_url": "https://media.hudle.in/venues/1fc5da20-96c3-4178-af14-32bb716eebd5/photo/61e9d6b2cf9e7800284f81ba6f4352d7ca71f85d",
        "hudle_url": "https://hudle.in/venues/pickle-play-l-thaltej/497142",
        "location": "Thaltej, Ahmedabad",
        "description": "Good Paddles",
        "created_at": datetime.now()
    },
      {
        "name": "AP Pickleball Club",
        "image_url": "https://media.hudle.in/venues/436a0066-772a-445c-863d-a3449454dc92/photo/cfb7f45cbfb71bc0aaae77c4a2f50147cfea8eeb",
        "hudle_url": "https://hudle.in/venues/ap-pickleball-club/614347",
        "location": "Thaltej, Hebatpur Village, Ahmedabad",
        "description": "Very far",
        "created_at": datetime.now()
    },
        {
        "name": "Fireball Arena",
        "image_url": "https://media.hudle.in/venues/2c12bb6a-8b44-40ab-9665-63af73896a22/photo/9016581c60e351e2da7785040d53687960653c84",
        "hudle_url": "https://hudle.in/venues/fireball-arena-sarkhej-okaf/307910",
        "location": "Sarkhej, Ahmedabad",
        "description": "Good Cricket Ground",
        "created_at": datetime.now()
    },
     {
        "name": "Kronyx sports arena",
        "image_url": "https://media.hudle.in/venues/b4e878ea-aceb-4fb7-9fbc-9c0cfc2511d3/photo/80e70412566b26ad2dd570e22b2aecef377b3410",
        "hudle_url": "https://hudle.in/venues/kronyx-pickleball-sports-arena/791270",
        "location": "Bopal, Ahmedabad",
        "description": "",
        "created_at": datetime.now()
    },
      {
        "name": "Racket Rebels Pickleball",
        "image_url": "https://media.hudle.in/venues/b65771c4-9104-4750-a493-014d4e260dc4/photo/63610f5539243cb8d91e0a22fec27ae93e348643",
        "hudle_url": "https://hudle.in/venues/racket-rebels-pickleball-mumatpura/312143",
        "location": "Mumatpura, Ahmedabad",
        "description": "",
        "created_at": datetime.now()
    },
        {
        "name": "TSG Pickleball Arena",
        "image_url": "https://media.hudle.in/venues/783e86f3-df69-46d4-9fc6-ea00575d6847/photo/0d4011194969819c0b51ee6f8ba4f4e92d9abcb2",
        "hudle_url": "https://hudle.in/venues/tsg-pickleball-arena-elite-sports-academy/309715",
        "location": "Motera, Ahmedabad",
        "description": "Five stars",
        "created_at": datetime.now()
    },
            {
        "name": "Smash Box cricket and Pickleball",
        "image_url": "https://media.hudle.in/venues/dc896cf1-0a55-46f8-a7b1-4ea3a7581e15/photo/81ee7e5891d7d381f267d359f13999bfffa37113",
        "hudle_url": "https://hudle.in/venues/smash-box-and-pickleball/612119",
        "location": "Sanand, Ahmedabad",
        "description": "",
        "created_at": datetime.now()
    },
]
result = venues_collection.insert_many(venues)
print(f"Inserted venue _ids: {result.inserted_ids}")
