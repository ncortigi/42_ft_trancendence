"""
Description: Serializers for the User model.

Main content:
1. class: UserSerializer(serializers.ModelSerializer)
"""

from rest_framework import serializers
from .models import User, Friendship, Player, Match

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid', 'username', 'email', 'description', 'image', 'language']

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid', 'language']

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid', 'username', 'status']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender_uid = serializers.CharField(source='sender.uid', read_only=True)
    receiver_uid = serializers.CharField(source='receiver.uid', read_only=True)
    class Meta:
        model = Friendship
        fields = ['sender_uid', 'receiver_uid', 'status']

class PlayerSerializer(serializers.ModelSerializer):
    player_uid = serializers.CharField(source='user.uid', read_only=True)
    class Meta:
        model = Player
        fields = ['player_uid', 'TOTP', 'TOTW', 'TW', 'PVPP', 'PVPW', 'PVEP', 'PVEW', 'TMAP', 'TMAW'] 

class LeaderboardSerializer(serializers.ModelSerializer):
    player_uid = serializers.CharField(source='user.uid', read_only=True)
    class Meta:
        model = Player
        fields = ['player_uid', 'TOTP', 'TOTW']

class MatchSerializer(serializers.ModelSerializer):
    player1_uid = serializers.CharField(source='player1.user.uid', read_only=True)
    player2_uid = serializers.CharField(source='player2.user.uid', read_only=True)
    bot_name = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = ['player1_uid', 'player2_uid', 'bot_name', 'player1_result', 'player2_result', 'mode', 'winner', 'date']

class SearchPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uid']