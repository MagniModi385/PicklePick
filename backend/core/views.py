from rest_framework.decorators import api_view
from rest_framework.response import Response
from decouple import config
from .mongo_connection import mongo_db
import requests
from bson import ObjectId
from datetime import datetime
import hashlib
from jose import jwt

def hash_text(text):
    """Hash any text for privacy"""
    return hashlib.sha256(text.encode()).hexdigest()[:32]

CLERK_API_KEY = config('CLERK_API_KEY')

def verify_clerk_token(token):
    """Verify Clerk JWT and fetch Clerk user info."""
    url = "https://api.clerk.com/v1/me"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    return None

def get_authenticated_user(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, Response({'error': 'Missing Clerk token'}, status=401)
    
    token = auth_header.replace('Bearer ', '')
    jwks_url = 'https://rested-oyster-81.clerk.accounts.dev/.well-known/jwks.json'
    
    try:
        response = requests.get(jwks_url)
        jwks = response.json()
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None, Response({'error': 'Failed to fetch JWKS keys'}, status=500)
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=['RS256'],
            options={"verify_aud": False}
        )
        
        # Automatically ensure profile exists for every authenticated request
        ensure_user_profile(mongo_db, payload)
        
        return payload, None
    except Exception as e:
        print(f"JWT decode error: {e}")
        return None, Response({'error': 'Invalid Clerk token'}, status=401)



@api_view(['GET'])
def health_check(request):
    return Response({'status': 'API is running!'})


@api_view(['PUT'])
def update_profile(request):
    user_data, error = get_authenticated_user(request)
    if error:
        return error
    
    clerk_user_id = user_data['user_id']
    data = request.data
    
    # Update only the fields user can edit - empty strings are allowed
    profile_update = {
        'first_name': data.get('first_name', ''),
        'last_name': data.get('last_name', ''),
        'skill_level': data.get('skill_level', ''),
        'location': data.get('location', ''),
    }
    
    # Update the profile
    mongo_db['profiles'].update_one(
        {'clerk_user_id': clerk_user_id},
        {'$set': profile_update},
        upsert=True  # Create if doesn't exist
    )
    
    return Response({"message": "Profile updated successfully"})


def ensure_user_profile(mongo_db, user_data):
    profiles = mongo_db['profiles']
    print(f"Called for user: {user_data.get('user_id')}")
    print(f"Available fields: {list(user_data.keys())}")
    
    # Check if user exists by Clerk user ID
    existing = profiles.find_one({'clerk_user_id': user_data['user_id']})
    
    if not existing:
        # Now we have reliable access to all fields
        new_profile = {
            'clerk_user_id': user_data['user_id'],
            'email': user_data.get('email', ''),  # This will now work!
            'username': '',
            'full_name': user_data.get('name', ''),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'location': '',
            'skill_level': '',
            'created_at': datetime.now(),
        }
        profiles.insert_one(new_profile)
        print(f"Created new profile with email: {user_data.get('email')}")

        
@api_view(['GET'])
def get_profile(request):
    try:
        print("=== get_profile endpoint called ===")
        
        user_data, error = get_authenticated_user(request)
        if error:
            return error
        
        print(f"User authenticated: {user_data.get('user_id')}")
        
        # Ensure profile exists
        ensure_user_profile(mongo_db, user_data)
        
        # Fetch and return profile
        profile = mongo_db['profiles'].find_one(
            {'clerk_user_id': user_data['user_id']},  # Use 'user_id' from template
            {'_id': 0}
        )
        
        if profile:
            print("Profile found and returned")
            return Response(profile)
        else:
            return Response({'error': 'Profile not found'}, status=404)
            
    except Exception as e:
        print(f"Exception: {str(e)}")
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def venue_list(request):
    venues_collection = mongo_db['venues']
    venues = list(venues_collection.find())
    for v in venues:
        v['_id'] = str(v['_id'])
    return Response(venues)


@api_view(['GET'])
def venue_detail(request, venue_id):
    venues_collection = mongo_db['venues']
    try:
        venue = venues_collection.find_one({'_id': ObjectId(venue_id)})
    except Exception:
        return Response({'error': 'Invalid venue ID'}, status=400)
    if not venue:
        return Response({'error': 'Venue not found'}, status=404)
    venue['_id'] = str(venue['_id'])
    return Response(venue)


@api_view(['POST'])
def create_post(request):
    user_data, error = get_authenticated_user(request)
    if error:
        return error

    # Debug: Print all available user data

    data = request.data

    required_fields = ['venue_id', 'title', 'skill_level', 'game_datetime', 'description', 'players_needed']
    missing = [field for field in required_fields if field not in data]
    if missing:
        return Response({"error": f"Missing fields: {', '.join(missing)}"}, status=400)

    try:
        game_datetime = datetime.fromisoformat(data['game_datetime'])
    except ValueError:
        return Response({"error": "Invalid game_datetime format, use ISO8601"}, status=400)

    try:
        venue_obj_id = ObjectId(data['venue_id'])
    except Exception:
        return Response({"error": "Invalid venue_id"}, status=400)

    # Check if venue exists
    if not mongo_db['venues'].find_one({'_id': venue_obj_id}):
        return Response({"error": "Venue not found"}, status=404)

    # Get user name from profile as fallback since JWT might not have it
    profile = mongo_db['profiles'].find_one({'clerk_user_id': user_data['user_id']})
    
    if profile:
        # Construct name from profile data
        if profile.get('full_name') and profile['full_name'].strip():
            user_name = profile['full_name']
        else:
            user_name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
        
        if not user_name:
            user_name = 'Anonymous'
    else:
        user_name = 'Anonymous'

    print(f"Profile found: {profile is not None}")
    print(f"Final user name: '{user_name}'")

    post_doc = {
        'venue_id': venue_obj_id,
        'title': data['title'].strip(),
        'skill_level': data['skill_level'].strip(),
        'game_datetime': game_datetime,
        'description': data['description'].strip(),
        'players_needed': int(data['players_needed']),
        'created_by': user_data['user_id'],
        'created_by_name': user_name,
        'interested_users': [],
        'created_at': datetime.now(),
    }

    result = mongo_db['posts'].insert_one(post_doc)
    return Response({"message": "Post created", "post_id": str(result.inserted_id)})


@api_view(['GET'])
def list_posts(request):
    venue_id = request.query_params.get('venue_id')
    if not venue_id:
        return Response({"error": "venue_id query param required"}, status=400)

    try:
        venue_obj_id = ObjectId(venue_id)
    except Exception:
        return Response({"error": "Invalid venue_id"}, status=400)

    now = datetime.now()
    posts_cursor = mongo_db['posts'].find({
        'venue_id': venue_obj_id,
        'game_datetime': {'$gte': now}
    })

    posts = []
    for p in posts_cursor:
        p['_id'] = str(p['_id'])
        p['venue_id'] = str(p['venue_id'])
        p['interested_count'] = len(p.get('interested_users', []))
        p['game_datetime'] = p['game_datetime'].isoformat()
        p['created_at'] = p['created_at'].isoformat()
        posts.append(p)

    return Response(posts)

@api_view(['PUT', 'DELETE'])
def post_detail(request, post_id):
    user_data, error = get_authenticated_user(request)
    if error:
        return error

    try:
        post_obj_id = ObjectId(post_id)
    except Exception:
        return Response({"error": "Invalid post ID"}, status=400)

    post = mongo_db['posts'].find_one({'_id': post_obj_id})
    if not post:
        return Response({"error": "Post not found"}, status=404)

    # Only the creator can update or delete
    if post['created_by'] != user_data['user_id']:
        return Response({"error": "Unauthorized"}, status=403)

    # ---------- UPDATE ----------
    if request.method == 'PUT':
        data = request.data
        update_fields = {}
        # Only update provided fields, e.g. title, description, etc.
        if 'title' in data:
            update_fields['title'] = data['title'].strip()
        if 'skill_level' in data:
            update_fields['skill_level'] = data['skill_level'].strip()
        if 'game_datetime' in data:
            try:
                update_fields['game_datetime'] = datetime.fromisoformat(data['game_datetime'])
            except ValueError:
                return Response({"error": "Invalid game_datetime format, use ISO8601"}, status=400)
        if 'description' in data:
            update_fields['description'] = data['description'].strip()
        if 'players_needed' in data:
            try:
                update_fields['players_needed'] = int(data['players_needed'])
            except ValueError:
                return Response({"error": "players_needed must be an integer"}, status=400)

        if not update_fields:
            return Response({"error": "No valid fields to update."}, status=400)

        mongo_db['posts'].update_one({'_id': post_obj_id}, {'$set': update_fields})
        return Response({"message": "Post updated"})

    # ---------- DELETE ----------
    elif request.method == 'DELETE':
        mongo_db['posts'].delete_one({'_id': post_obj_id})
        return Response({"message": "Post deleted"})


@api_view(['POST'])
def toggle_interest(request, post_id):
    user_data, error = get_authenticated_user(request)
    if error:
        return error

    try:
        post_obj_id = ObjectId(post_id)
    except Exception:
        return Response({"error": "Invalid post ID"}, status=400)

    post = mongo_db['posts'].find_one({'_id': post_obj_id})
    if not post:
        return Response({"error": "Post not found"}, status=404)

    # Fix: Use 'user_id' instead of 'id'
    clerk_user_id = user_data['user_id']
    interested_users = post.get('interested_users', [])

    if clerk_user_id in interested_users:
        interested_users.remove(clerk_user_id)
        action = 'removed'
    else:
        interested_users.append(clerk_user_id)
        action = 'added'

    mongo_db['posts'].update_one({'_id': post_obj_id}, {'$set': {'interested_users': interested_users}})

    return Response({"message": f"Interest {action}"})


@api_view(['GET'])
def get_my_posts(request):
    user_data, error = get_authenticated_user(request)
    if error:
        return error

    posts_cursor = mongo_db['posts'].find({'created_by': user_data['user_id']})
    posts = []
    for p in posts_cursor:
        p['_id'] = str(p['_id'])
        p['venue_id'] = str(p['venue_id'])
        p['game_datetime'] = p['game_datetime'].isoformat()
        p['created_at'] = p['created_at'].isoformat()

        # Lookup interested user profiles
        interested_profiles = []
        for user_id in p.get('interested_users', []):
            profile = mongo_db['profiles'].find_one({'clerk_user_id': user_id})
            if profile:
                # Construct name from first_name + last_name
                first_name = profile.get('first_name', '')
                last_name = profile.get('last_name', '')
                full_name = f"{first_name} {last_name}".strip()
                
                if not full_name:  # fallback if both are empty
                    full_name = profile.get('full_name', 'Anonymous')
                
                interested_profiles.append({
                    'user_id': user_id,
                    'full_name': full_name,
                    'skill_level': profile.get('skill_level', ''),
                })
            else:
                # User profile not found
                interested_profiles.append({
                    'user_id': user_id,
                    'full_name': 'Anonymous',
                    'skill_level': '',
                })
        
        p['interested_profiles'] = interested_profiles
        posts.append(p)

    return Response(posts)

@api_view(['POST'])
def send_message(request):
    user_data, error = get_authenticated_user(request)
    if error:
        return error
    
    data = request.data
    
    # Get sender profile
    sender_profile = mongo_db['profiles'].find_one({'clerk_user_id': user_data['user_id']})
    if sender_profile:
        first_name = sender_profile.get('first_name', '')
        last_name = sender_profile.get('last_name', '')
        sender_name = f"{first_name} {last_name}".strip() or 'Anonymous'
    else:
        sender_name = 'Anonymous'
    
    message_doc = {
        'sender_id': user_data['user_id'],  # Keep for functionality
        'sender_name_hash': hash_text(sender_name),  # Hash for privacy
        'receiver_id': data['receiver_id'],
        'message_encrypted': data['message'],  # Already encrypted from frontend
        'message_hash': hash_text(data['message']),  # Hash for privacy
        'timestamp': datetime.now(),
        'read': False
    }
    
    mongo_db['messages'].insert_one(message_doc)
    return Response({'message': 'Message sent securely'})


@api_view(['GET'])
def get_conversation(request, other_user_id):
    user_data, error = get_authenticated_user(request)
    if error:
        return error
    
    messages = list(mongo_db['messages'].find({
        '$or': [
            {'sender_id': user_data['user_id'], 'receiver_id': other_user_id},
            {'sender_id': other_user_id, 'receiver_id': user_data['user_id']}
        ]
    }).sort('timestamp', 1))
    
    # Process messages for frontend display
    for msg in messages:
        msg['_id'] = str(msg['_id'])
        msg['timestamp'] = msg['timestamp'].isoformat()
        
        # Send encrypted message to frontend (it will decrypt client-side)
        if 'message_encrypted' in msg:
            msg['message_encrypted'] = msg['message_encrypted']
        else:
            msg['message_encrypted'] = msg.get('message', '')
        
        # Get actual sender name for display (not from hash)
        if msg['sender_id'] == user_data['user_id']:
            msg['sender_name'] = 'You'
        else:
            # Get other user's profile for display
            other_profile = mongo_db['profiles'].find_one({'clerk_user_id': msg['sender_id']})
            if other_profile:
                first_name = other_profile.get('first_name', '')
                last_name = other_profile.get('last_name', '')
                msg['sender_name'] = f"{first_name} {last_name}".strip() or 'Anonymous'
            else:
                msg['sender_name'] = 'Anonymous'
        
        # Remove hash fields from response (not needed by frontend)
        msg.pop('message_hash', None)
        msg.pop('sender_name_hash', None)
    
    return Response(messages)
@api_view(['GET'])
def get_conversations(request):
    user_data, error = get_authenticated_user(request)
    if error:
        return error
    
    current_user_id = user_data['user_id']
    
    # Find all unique users who have had conversations with current user
    messages = list(mongo_db['messages'].find({
        '$or': [
            {'sender_id': current_user_id},
            {'receiver_id': current_user_id}
        ]
    }))
    
    # Extract unique user IDs (excluding current user)
    unique_users = set()
    for msg in messages:
        if msg['sender_id'] == current_user_id:
            unique_users.add(msg['receiver_id'])
        elif msg['receiver_id'] == current_user_id:
            unique_users.add(msg['sender_id'])
    
    conversations = []
    
    for other_user_id in unique_users:
        # Get last message for this conversation
        last_message = mongo_db['messages'].find({
            '$or': [
                {'sender_id': current_user_id, 'receiver_id': other_user_id},
                {'sender_id': other_user_id, 'receiver_id': current_user_id}
            ]
        }).sort('timestamp', -1).limit(1)
        
        last_message = list(last_message)
        if last_message:
            last_msg = last_message[0]
            
            # Get other user's profile info
            other_profile = mongo_db['profiles'].find_one({'clerk_user_id': other_user_id})
            if other_profile:
                first_name = other_profile.get('first_name', '')
                last_name = other_profile.get('last_name', '')
                other_user_name = f"{first_name} {last_name}".strip() or 'Anonymous'
            else:
                other_user_name = 'Anonymous'
            
            conversations.append({
                'user_id': other_user_id,
                'user_name': other_user_name,
                'last_message': 'New message',  # Generic preview for privacy
                'last_message_time': last_msg['timestamp'].isoformat(),
                'last_sender_id': last_msg['sender_id'],
                'unread_count': 0  # You can implement this later
            })
    
    # Sort by last message time (most recent first)
    conversations.sort(key=lambda x: x['last_message_time'], reverse=True)
    
    return Response(conversations)

from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.http import JsonResponse
from scraper import scrape_venue_slots
import json

@csrf_exempt
@api_view(['POST'])
def scrape_slots(request):
    """API endpoint to scrape venue slots - no authentication required"""
    try:
        data = json.loads(request.body)
        venue_url = data.get('venue_url')
        venue_name = data.get('venue_name', 'Unknown Venue')
        
        if not venue_url:
            return JsonResponse({'error': 'venue_url is required'}, status=400)
        
        print(f"🎯 API Request: Scraping {venue_name}")
        
        # Run the headless scraper
        result = scrape_venue_slots(venue_url, venue_name)
        
        if result.get('status') == 'error':
            return JsonResponse(result, status=500)
        
        return JsonResponse(result)
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)
