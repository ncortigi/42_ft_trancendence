"""
Description: This file contains the models for the authentication application.

Main content:
1. UserManager(BaseUserManager)
2. class: User(AbstractBaseUser, PermissionsMixin)
3. class: Friendship(models.Model)
"""

import random
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.password_validation import validate_password  
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin

# Custom user manager to handle user creation
class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        try:
            # Validate the password using Django's password validators
            validate_password(password, user)
            user.set_password(password)
        except Exception as e:
            raise ValueError(_('Password is not valid: ') + str(e))
        if not user.uid and not user.is_superuser:
            user.uid = username + '#' + str(self.generate_uid())
        user.save()
        return user

    def generate_uid(self):
        while True:
            number = random.randint(10, 9999)
            uid = f"{number:04d}"
            if not User.objects.filter(uid__endswith=uid).exists():
                return uid

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)
    
    def update_user(self, user, **extra_fields):
        for key, value in extra_fields.items():
            setattr(user, key, value)
            if key == 'username':
                user.uid = value + '#' + str(user.uid.split('#')[1])
        user.save()
        return user

# Custom user model
class User(AbstractBaseUser, PermissionsMixin):
    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=10)
    password = models.CharField(max_length=128)
    description = models.TextField(max_length=500, blank=True, null=True, default='Enter your description here...')
    image = models.ImageField(upload_to='images/', blank=True, default='images/default-avatar.jpg')
    language = models.CharField(max_length=2, choices=[('en', 'English'), ('it', 'Italian'), ('es', 'Spanish')], default='en')
    
    uid = models.CharField(max_length=15, unique=True)
    status = models.CharField(max_length=10, choices=[('online', 'Online'), ('offline', 'Offline')], default='offline')
    friends = models.ManyToManyField('self', through='Friendship', symmetrical=False)
    
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Set email as the unique identifier for authentication
    REQUIRED_FIELDS = ['username']  # Fields required when creating a superuser

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

class Friendship(models.Model):
    sender = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friendship')]

class Player(models.Model):
    GAME_CHOICES = [
        ('pong', 'Pong'),
        ('tris', 'Tris'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="player")
    game_type = models.CharField(max_length=10, choices=GAME_CHOICES)
    TOTP = models.PositiveIntegerField(default=0, verbose_name='Total Matches Played')
    TOTW = models.PositiveIntegerField(default=0, verbose_name='Total Wins')
    TW = models.PositiveIntegerField(default=0, verbose_name='Tournaments Won')

    PVPP = models.PositiveIntegerField(default=0, verbose_name='Local Matches Played')
    PVPW = models.PositiveIntegerField(default=0, verbose_name='Local Matches Won')
    PVEP = models.PositiveIntegerField(default=0, verbose_name='Bot Matches Played')
    PVEW = models.PositiveIntegerField(default=0, verbose_name='Bot Matches Won')
    TMAP = models.PositiveIntegerField(default=0, verbose_name='Tournaments Matches Played')
    TMAW = models.PositiveIntegerField(default=0, verbose_name='Tournaments Matches Won')

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'game_type'], name='unique_user_game_type')]

    def __str__(self):
        return f"{self.user.username} - {self.game_type}"

class Match(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player2', null=True, blank=True)
    bot_name = models.CharField(max_length=10, null=True, blank=True, verbose_name='Bot Name')
    game = models.CharField(max_length=10, choices=[('pong', 'Pong'), ('tris', 'Tris')], verbose_name='Game Type')
    mode = models.CharField(max_length=10, choices=[('local', 'Local'), ('bot', 'Bot'), ('tournament', 'Tournament')], verbose_name='Game Mode')
    player1_result = models.PositiveIntegerField(default=0, verbose_name='Player 1 Result')
    player2_result = models.PositiveIntegerField(default=0, verbose_name='Player 2 Result')
    winner = models.CharField(max_length=10, choices=[('player1', 'Player 1'), ('player2', 'Player 2'), ('draw', 'Draw')], verbose_name='Winner')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.bot_name:
            return f"{self.player1.user.username} vs {self.bot_name} - Winner: {self.winner}"
        return f"{self.player1.user.username} vs {self.player2.user.username} - Winner: {self.winner}"