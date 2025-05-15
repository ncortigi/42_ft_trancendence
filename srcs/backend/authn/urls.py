"""
Description: This file contains the urls for the authn app.

Main content:
1. array: urlpatterns
"""

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import IsAuthenticatedView, Login, LoginGuest, Logout, Signup, InfoView, CSRFTokenView, FriendView, FriendRequestView, PongInfoView, PongLeaderboardView, PongGamesView, TrisInfoView, TrisLeaderboardView, TrisGamesView, SearchPlayerView

urlpatterns = [
    # Methods: GET
    path('is-authenticated/', IsAuthenticatedView.as_view(), name='is_authenticated'),
    # Methods: GET
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf_token'),
    # Methods: GET
    path('signup/', Signup.as_view(), name='signup'),
    # Methods: POST
    path('login/', Login.as_view(), name='login'),
    # Methods: GET, POST
    path('login-guest/', LoginGuest.as_view(), name='login_guest'),
    # Methods: POST
    path('logout/', Logout.as_view(), name='logout'),
    # Methods: POST
    path('user-info/', InfoView.as_view(), name='info'),
    # Methods: GET, PUT
    path('friend/', FriendView.as_view(), name='friend'),
    # Methods: GET
    path('friend/request/', FriendRequestView.as_view(), name='friend_request'),
    # Methods: GET, POST, PUT
    path('pong/info/', PongInfoView.as_view(), name='pong_info'),
    # METHODS: GET, POST
    path('pong/games/', PongGamesView.as_view(), name='pong_games'),
    # METHODS: GET, POST
    path('pong/leaderboard/', PongLeaderboardView.as_view(), name='pong_leaderboard'),
    # METHODS: GET
    path('tris/info/', TrisInfoView.as_view(), name='tris'),
    # METHODS: GET, POST
    path('tris/games/', TrisGamesView.as_view(), name='tris_games'),
    # METHODS: GET, POST
    path('tris/leaderboard/', TrisLeaderboardView.as_view(), name='tris_leaderboard'),
    # METHODS: GET
    path('search-player/', SearchPlayerView.as_view(), name='search_player'),
    # METHODS: GET
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
