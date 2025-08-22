from django.urls import path
from .views import (
    get_conversation,
    get_conversations,
    health_check,
    get_profile,
    scrape_slots,
    send_message,
    update_profile,
    venue_list,
    venue_detail,
    create_post,
    list_posts,
    post_detail,
    toggle_interest,
    get_my_posts,
)

urlpatterns = [
    path('health/', health_check),
    path('profile/update/', update_profile),
    path('profile/', get_profile),
    path('venues/', venue_list),
    path('venues/<str:venue_id>/', venue_detail),
    path('posts/', list_posts),                     # GET list posts by venue_id query param
    path('posts/create/', create_post),             # POST create new post
    path('posts/my/', get_my_posts),                 # GET user's posts with interested users
    path('posts/<str:post_id>/', post_detail),
    path('posts/<str:post_id>/interest/', toggle_interest),
    path('messages/send/', send_message),
    path('messages/<str:other_user_id>/', get_conversation),
    path('conversations/', get_conversations),
    path('scrape-slots/', scrape_slots),
]