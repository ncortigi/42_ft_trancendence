"""
Description: This file contains the views for the authentication service.

Main content:
1. function: create_response(response)
2. class: IsAuthenticatedView(APIView) [get]
3. class: CSRFTokenView(APIView) [get]
4. class: Signup(APIView) [post]
5. class: Oauth2(APIView) [post]
6. class: Login(APIView) [post, get]
7. class: Logout(APIView) [post]
8. class: InfoView(APIView) [get, put]

For more information, check the Project documentation.
"""

import logging
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.db import models
from django.conf import settings
import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import BasicAuthentication, SessionAuthentication, TokenAuthentication
from .models import User, Friendship, Player, Match
from .serializers import UserSerializer, FriendSerializer, FriendRequestSerializer, LoginSerializer, PlayerSerializer, LeaderboardSerializer, MatchSerializer, SearchPlayerSerializer

LOGGER = logging.getLogger('web')

def create_response(response):
    if hasattr(response, 'data') and isinstance(response.data, dict):
        response.data['log_index'] = 'authn'
    return response

class IsAuthenticatedView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        LOGGER.debug('- IsAuthenticatedView.get()')
        LOGGER.debug(f"CSRF Cookie: {request.COOKIES.get('csrftoken')}")
        LOGGER.debug(f"Session ID: {request.COOKIES.get('sessionid')}")
        if request.user.is_authenticated:
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': 'Authenticated', 'data': {'uid': str(request.user.uid)}}
            ))
        return create_response(Response(
            status=status.HTTP_401_UNAUTHORIZED,
            data={'message': 'Not authenticated'}
        ))

class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        LOGGER.debug('- CSRFTokenView.get()')
        csrf_token = request.COOKIES.get('csrftoken')
        if not csrf_token:
            csrf_token = get_token(request) # Genera il token CSRF
        request.COOKIES.get('csrftoken')
        LOGGER.debug(f"CSRF Token Generated: {csrf_token}")
        response = create_response(Response(
            status=status.HTTP_200_OK,
            data={'message': 'CSRF token retrieved', 'data': csrf_token}
        ))
        response.set_cookie(
            'csrftoken',
            csrf_token,
            httponly=False,  # Deve essere False per consentire l'accesso dal frontend
            samesite='Lax'
        )
        return response

class Signup(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        LOGGER.debug('- Signup.post()')

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))

        if User.objects.filter(email=email).exists():
            LOGGER.warning('Email already exists')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Email already exists'}
            ))

        try:
            LOGGER.info('Creating user')
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            LOGGER.info('User created')
            return create_response(Response(
                status=status.HTTP_201_CREATED,
                data={'message': 'Signup successful'}
            ))
        except Exception as e:
            LOGGER.error(f'Error creating user: {str(e)}')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': str(e)}
            ))

class Login(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        LOGGER.debug('- Login.get()')
        if request.user.is_authenticated:
            LOGGER.info('User is already logged in')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={
                    'message': 'Already logged in',
                    'data': LoginSerializer(request.user).data
                }
            ))
        else:
            LOGGER.warning('Not logged in')
            return create_response(Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={'message': 'Not logged in'}
            ))

    def post(self, request):
        LOGGER.debug('- Login.post()')

        # Cancella la sessione corrente
        if request.user.is_authenticated:
            LOGGER.info('User is already logged in')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={
                    'message': 'Already logged in',
                    'data': LoginSerializer(request.user).data
                }
            ))

        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))

        # Verifica se l'email esiste
        try:
            user = User.objects.get(email=email.strip().lower())
        except User.DoesNotExist:
            LOGGER.warning('Email not found')
            return create_response(Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={'message': 'Invalid email'}
            ))

        # Verifica se la password è corretta
        if not user.check_password(password):
            LOGGER.warning('Invalid password')
            return create_response(Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={'message': 'Invalid password'}
            ))

        # Autentica l'utente
        user = authenticate(email=email.strip().lower(), password=password)
        if user is not None:
            LOGGER.info('Login successful')
            auth_login(request, user)
            user.status = 'online'
            user.save()
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': 'Login successful'}
            ))
        else:
            LOGGER.warning('Authentication failed')
            return create_response(Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={'message': 'Authentication failed'}
            ))

class LoginGuest(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def post(self, request):
        LOGGER.debug('- LoginGuest.post()')
        LOGGER.debug(f'Request user: {request.user}')
        LOGGER.debug(f'Is authenticated: {request.user.is_authenticated}')

        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            LOGGER.warning('Missing email or password')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Email and password are required'}
            ))

        if request.user.is_authenticated and email == request.user.email:
            LOGGER.warning('Cannot log in as yourself')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Cannot log in as yourself'}
            ))

        try:
            guest_user = User.objects.get(email=email)
            if not guest_user.check_password(password):
                LOGGER.warning('Invalid password for guest user')
                return create_response(Response(
                    status=status.HTTP_401_UNAUTHORIZED,
                    data={'message': 'Invalid password'}
                ))

            LOGGER.info(f'Guest login successful for user {guest_user.username}')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={
                    'message': 'Guest login successful',
                    'data': {
                        'uid': guest_user.uid,
                        'username': guest_user.username,
                    }
                }
            ))
        except User.DoesNotExist:
            LOGGER.warning('Guest user not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'Invalid email'}
            ))

class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        LOGGER.debug('- Logout.post()')
        if not request.user.is_authenticated:
            LOGGER.warning('Not authenticated')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Not logged in'}
            ))

        request.user.status = 'offline'
        request.user.save()

        LOGGER.info('Clearing session and logging out')
        auth_logout(request)
        return create_response(Response(
            status=status.HTTP_200_OK,
            data={'message': 'Logout successful'}
        ))

class InfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- UserInfoView.get()')
        uid = request.query_params.get('uid')

        if not uid:
            LOGGER.warning('UID is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'UID is required'}
            ))

        try:
            user = User.objects.get(uid=uid)
            LOGGER.info(f'User info retrieved for UID: {uid}')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={
                    'message': 'User info retrieved',
                    'data': UserSerializer(user).data
                }
            ))
        except User.DoesNotExist:
            LOGGER.warning(f'User with UID {uid} not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'User not found'}
            ))
        
    def put(self, request):
        LOGGER.debug('- InfoView.put()')

        # Recupera i dati dalla richiesta
        user_status = request.data.get('status')
        description = request.data.get('description')
        image = request.FILES.get('image')
        language = request.data.get('language')
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        new_password = request.data.get('newPassword')

        # Controlla che almeno un campo sia presente nella richiesta
        if not any(value is None for value in [user_status, description, image, language, email, username, password, new_password]):
            LOGGER.warning('No fields provided for update')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'No fields provided for update'}
            ))

        try:
            if user_status:
                request.user.status = user_status
                LOGGER.info('Status updated')

            if description is not None:
                request.user.description = description
                LOGGER.info('Description updated')

            if image:
                request.user.image = image
                LOGGER.info('Image updated')

            if language:
                request.user.language = language
                LOGGER.info('Language updated')

            if email and username and password:
                # Controlla che la password fornita corrisponda a quella salvata
                if not request.user.check_password(password):
                    LOGGER.warning('Invalid current password')
                    return create_response(Response(
                        status=status.HTTP_401_UNAUTHORIZED,
                        data={'message': 'Invalid current password'}
                    ))
                
                if User.objects.filter(email=email).exclude(uid=request.user.uid).exists():
                    LOGGER.warning('Email already exists')
                    return create_response(Response(
                        status=status.HTTP_400_BAD_REQUEST,
                        data={'message': 'Email already exists'}
                    ))

                request.user.email = email
                request.user.username = username
                id_part = request.user.uid.split('#')[1]
                request.user.uid = f"{username}#{id_part}"
                if new_password:
                    request.user.set_password(new_password)
                    LOGGER.info('New password set')
                LOGGER.info('Email, username, and password updated')

            # Salva le modifiche
            request.user.save()
            LOGGER.info('User info updated successfully')

            if image:
                image_url = request.user.image.url
                return create_response(Response(
                    status=status.HTTP_200_OK,
                    data={
                        'message': 'User image updated successfully',
                        'image_url': image_url,
                    }
                ))

            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': 'User info updated successfully'}
            ))

        except Exception as e:
            LOGGER.error(f'Error updating user info: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while updating user info'}
            ))

class FriendView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    # Get friends
    def get(self, request):
        LOGGER.debug('- FriendView.get()')

        uid = request.user.uid
        
        user = get_object_or_404(User, uid=uid)
        friends = (Friendship.objects.filter(sender=user) | Friendship.objects.filter(receiver=user)) & Friendship.objects.filter(status='accepted')
        friends_data = []
        for friendship in friends:
            # Determina chi è l'amico (sender o receiver)
            friend = friendship.receiver if friendship.sender == user else friendship.sender
            friend_data = FriendSerializer(friend).data
            friends_data.append(friend_data)

        LOGGER.info('Accepted friends retrieved')
        return create_response(Response(
            status=status.HTTP_200_OK,
            data={
                'message': 'Accepted friends retrieved',
                'data': friends_data
            }
        ))

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    # Get friends request
    def get(self, request):
        LOGGER.debug('- FriendRequestView.get()')

        uid = request.user.uid
        user = get_object_or_404(User, uid=uid)
        friend_requests = (Friendship.objects.filter(receiver=user) | Friendship.objects.filter(sender=user)) & Friendship.objects.filter(status='pending')
        if not friend_requests.exists():
            LOGGER.info('No friend requests found')
            return create_response(Response({
                'message': 'No friend requests found',
                'data': []
            }, status=status.HTTP_200_OK))
        friend_requests_data = []
        for friendship in friend_requests:
            friend_request_data = FriendRequestSerializer(friendship).data
            friend_requests_data.append(friend_request_data)

        LOGGER.info('Friend requests retrieved')
        return create_response(Response(
            status=status.HTTP_200_OK,
            data={
                'message': 'Friend requests retrieved',
                'data': friend_requests_data
            }
        ))

    # Send friend request
    def post(self, request):
        LOGGER.debug('- FriendRequestView.post()')

        emitter_uid = request.data.get('emitter-uid')
        receiver_uid = request.data.get('receiver-uid')
        LOGGER.debug(f"Emitter UID: {emitter_uid}, Receiver UID: {receiver_uid}")
        # Controllo: Campi richiesti
        if not all([emitter_uid, receiver_uid]):
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))
        
        # Recupera l'emittente e il destinatario
        emitter = get_object_or_404(User, uid=emitter_uid)
        receiver = get_object_or_404(User, uid=receiver_uid)
        
        # Controllo: Richiesta duplicata
        if Friendship.objects.filter(models.Q(sender=emitter, receiver=receiver) | models.Q(sender=receiver, receiver=emitter)).exists():
            LOGGER.warning('Friend request already exists')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Friend request already exists'}
            ))
        
        # Crea la richiesta di amicizia
        try:
            friendship = Friendship(sender=emitter, receiver=receiver)
            friendship.save()
            LOGGER.info('Friend request sent')
            return create_response(Response(
                status=status.HTTP_201_CREATED,
                data={'message': 'Friend request sent'}
            ))
        except Exception as e:
            LOGGER.error(f'Error sending friend request: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while sending the friend request'}
            ))
    
    # Update friend request status
    def put(self, request):
        LOGGER.debug('- FriendRequestView.put()')

        receiver_uid = request.user.uid
        emitter_uid = request.data.get('emitter-uid')
        new_status = request.data.get('status')
        
        # Controllo: Campi richiesti
        if not all([emitter_uid, new_status]):
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))
        
        # Controllo: Validazione dello stato
        if new_status not in ['accepted', 'rejected']:
            LOGGER.warning(f'Invalid status: {new_status}')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Invalid status'}
            ))
            
        # Recupera l'emittente e il destinatario
        LOGGER.debug(f"Emitter UID: {emitter_uid}, Receiver UID: {receiver_uid}, New Status: {new_status}")
        sender = get_object_or_404(User, uid=emitter_uid)
        receiver = request.user
        friendship = get_object_or_404(Friendship, sender=sender, receiver=receiver)
        try:
            friendship.status = new_status
            friendship.save()
            LOGGER.info(f'Friend request status updated to {new_status}')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': f'Friend request updated to {new_status}'}
            ))
        except Exception as e:
            LOGGER.error(f'Error updating friend request: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while updating the friend request'}
            ))

class PongInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- PongInfoView.get()')

        # Recupera l'UID dal parametro della query
        uid = request.query_params.get('uid')
        if not uid:
            LOGGER.warning('UID is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'UID is required'}
            ))

        # Recupera l'utente associato all'UID
        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            LOGGER.warning(f'User with UID {uid} not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'User not found'}
            ))

        # Crea il Player se non esiste
        pong_player, created = Player.objects.get_or_create(user=user, game_type='pong')
        if created:
            LOGGER.info(f'Pong player created for user: {user.username}')

        # Serializza i dati del giocatore
        pong_serializer = PlayerSerializer(pong_player)

        LOGGER.info(f'Pong player info retrieved for user: {user.username}')
        return create_response(Response({
            'message': 'Pong player info retrieved',
            'data': pong_serializer.data
        }, status=status.HTTP_200_OK))

    def post(self, request):
        LOGGER.debug('- PongInfoView.post()')

        uid = request.data.get('uid')
        if not uid:
            LOGGER.warning('UID is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'UID is required'}
            ))

        try:
            user = User.objects.get(uid=uid)
            pong_player = Player.objects.get(user=user, game_type='pong')

            pong_player.TW += 1
            pong_player.save()

            LOGGER.info(f'Tournament win recorded for user: {user.username}')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': 'Tournament win recorded successfully'}
            ))

        except User.DoesNotExist:
            LOGGER.warning(f'User with UID {uid} not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'User not found'}
            ))
        except Player.DoesNotExist:
            LOGGER.warning(f'Pong player not found for user with UID {uid}')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'Pong player not found'}
            ))
        except Exception as e:
            LOGGER.error(f'Error recording tournament win: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while recording the tournament win'}
            ))
    
class PongGamesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- PongGamesView.get()')

        # Recupera l'UID dell'utente target (se fornito)
        target_uid = request.query_params.get('uid')

        # Se non è fornito, usa l'utente autenticato
        if not target_uid:
            target_user = request.user
        else:
            try:
                target_user = User.objects.get(uid=target_uid)
            except User.DoesNotExist:
                LOGGER.warning(f'User with UID {target_uid} not found')
                return create_response(Response({
                    'message': 'User not found',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND))

        # Crea il Player se non esiste
        pong_player, created = Player.objects.get_or_create(user=target_user, game_type='pong')
        if created:
            LOGGER.info(f'Pong player created for user: {target_user.username}')

        # Recupera le partite associate al giocatore
        matches = Match.objects.filter(
            models.Q(player1=pong_player) | models.Q(player2=pong_player), game='pong').order_by('-date')

        if not matches.exists():
            LOGGER.info(f'No Pong matches found for user: {target_user.username}')
            return create_response(Response({
                'message': 'No Pong matches found',
                'data': []
            }, status=status.HTTP_200_OK))

        matches_data = []
        for match in matches:
            match_data = MatchSerializer(match).data
            if match.bot_name:  # Aggiungi il nome del bot se presente
                match_data['player2_name'] = match.bot_name
            matches_data.append(match_data)

        LOGGER.info(f'Pong matches retrieved for user: {target_user.username}')
        return create_response(Response({
            'message': 'Pong matches retrieved',
            'data': matches_data
        }, status=status.HTTP_200_OK))

    def post(self, request):
        LOGGER.debug('- PongGamesView.post()')

        # Recupera i dati dalla richiesta
        player1_uid = request.data.get('player1_uid')
        player2_uid = request.data.get('player2_uid')
        mode = request.data.get('mode')
        p1_score = request.data.get('p1_score')
        p2_score = request.data.get('p2_score')

        if any(value is None for value in [player1_uid, player2_uid, mode, p1_score, p2_score]):
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))

        try:
            player1_user = User.objects.get(uid=player1_uid)
            player1, created = Player.objects.get_or_create(user=player1_user, game_type='pong')
            if created:
                LOGGER.info(f'Pong player created for user: {player1_user.username}')

            if player2_uid == 'AM':
                player2 = None
                bot_name = "AM"
            else:
                player2_user = User.objects.get(uid=player2_uid)
                player2, created = Player.objects.get_or_create(user=player2_user, game_type='pong')
                if created:
                    LOGGER.info(f'Pong player created for user: {player2_user.username}')
                bot_name = None

            # Aggiorna le statistiche
            player1.TOTP += 1
            if player2:
                player2.TOTP += 1

            if p1_score > p2_score:
                player1.TOTW += 1
                winner = 'player1'
            elif p1_score < p2_score:
                if player2:
                    player2.TOTW += 1
                winner = 'player2'

            # Aggiorna le statistiche in base alla modalità
            if mode.lower() == 'local':
                player1.PVPP += 1
                if player2:
                    player2.PVPP += 1
                if p1_score > p2_score:
                    player1.PVPW += 1
                elif p1_score < p2_score and player2:
                    player2.PVPW += 1
            elif mode.lower() == 'tournament':
                player1.TMAP += 1
                if player2:
                    player2.TMAP += 1
                if p1_score > p2_score:
                    player1.TMAW += 1
                elif p1_score < p2_score and player2:
                    player2.TMAW += 1
            elif mode.lower() == 'bot':
                player1.PVEP += 1
                if p1_score > p2_score:
                    player1.PVEW += 1

            # Salva le statistiche aggiornate
            player1.save()
            if player2:
                player2.save()

            # Salva la partita nel database
            match = Match.objects.create(
                player1=player1,
                player2=player2,
                bot_name=bot_name,
                game='pong',
                mode=mode.lower(),
                player1_result=p1_score,
                player2_result=p2_score,
                winner=winner
            )
            match.save()

            LOGGER.info('Match saved successfully')
            return create_response(Response(
                status=status.HTTP_201_CREATED,
                data={'message': 'Match saved successfully'}
            ))

        except User.DoesNotExist as e:
            if player1_uid:
                LOGGER.warning(f'User not found for player1_uid: {player1_uid}')
            if player2_uid:
                LOGGER.warning(f'User not found for player2_uid: {player2_uid}')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': f'User not found: {str(e)}'}
            ))
        except Exception as e:
            LOGGER.error(f'Error saving match: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while saving the match'}
            ))

class PongLeaderboardView(APIView):
    permission_classes = [AllowAny]  # Permette l'accesso a chiunque, senza autenticazione

    def get(self, _):
        LOGGER.debug('- PongLeaderboardView.get()')
        # Recupera i giocatori di Pong ordinati per vittorie totali (TOTW)
        leaderboard = Player.objects.filter(game_type='pong', TOTP__gt=0).order_by('-TOTW')[:10]  # Prendi i primi 10

        if not leaderboard.exists():
            LOGGER.info('No players found for Pong leaderboard')
            return create_response(Response({
                'message': 'No players found for Pong leaderboard',
                'data': []
            }, status=status.HTTP_200_OK))

        leaderboard_serializer = LeaderboardSerializer(leaderboard, many=True)
        LOGGER.info(f'Pong leaderboard retrieved with {len(leaderboard)} players')
        return create_response(Response({
            'message': 'Pong leaderboard retrieved',
            'data': leaderboard_serializer.data
        }, status=status.HTTP_200_OK))

class TrisInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- TrisInfoView.get()')

        # Recupera l'UID dal parametro della query
        uid = request.query_params.get('uid')
        if not uid:
            LOGGER.warning('UID is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'UID is required'}
            ))

        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            LOGGER.warning(f'User with UID {uid} not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'User not found'}
            ))

        # Crea il Player se non esiste
        tris_player, created = Player.objects.get_or_create(user=user, game_type='tris')
        if created:
            LOGGER.info(f'Tris player created for user: {user.username}')

        tris_serializer = PlayerSerializer(tris_player)
        LOGGER.info(f'Tris player info retrieved for user: {user.username}')
        return create_response(Response({
            'message': 'Tris player info retrieved',
            'data': tris_serializer.data
        }, status=status.HTTP_200_OK))
    
    def post(self, request):
        LOGGER.debug('- TrisInfoView.post()')

        uid = request.data.get('uid')
        if not uid:
            LOGGER.warning('UID is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'UID is required'}
            ))

        try:
            user = User.objects.get(uid=uid)
            tris_player = Player.objects.get(user=user, game_type='tris')

            tris_player.TW += 1
            tris_player.save()

            LOGGER.info(f'Tournament win recorded for user: {user.username}')
            return create_response(Response(
                status=status.HTTP_200_OK,
                data={'message': 'Tournament win recorded successfully'}
            ))

        except User.DoesNotExist:
            LOGGER.warning(f'User with UID {uid} not found')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'User not found'}
            ))
        except Player.DoesNotExist:
            LOGGER.warning(f'Tris player not found for user with UID {uid}')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': 'Tris player not found'}
            ))
        except Exception as e:
            LOGGER.error(f'Error recording tournament win: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while recording the tournament win'}
            ))

class TrisGamesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- TrisGamesView.get()')

        # Recupera l'UID dell'utente target (se fornito)
        target_uid = request.query_params.get('uid')

        # Se non è fornito, usa l'utente autenticato
        if not target_uid:
            target_user = request.user
        else:
            try:
                target_user = User.objects.get(uid=target_uid)
            except User.DoesNotExist:
                LOGGER.warning(f'User with UID {target_uid} not found')
                return create_response(Response({
                    'message': 'User not found',
                    'data': []
                }, status=status.HTTP_404_NOT_FOUND))

        # Crea il Player se non esiste
        tris_player, created = Player.objects.get_or_create(user=target_user, game_type='tris')
        if created:
            LOGGER.info(f'Tris player created for user: {target_user.username}')

        # Recupera le partite associate al giocatore
        matches = Match.objects.filter(
            models.Q(player1=tris_player) | models.Q(player2=tris_player), game='tris').order_by('-date')

        if not matches.exists():
            LOGGER.info(f'No Tris matches found for user: {target_user.username}')
            return create_response(Response({
                'message': 'No Tris matches found',
                'data': []
            }, status=status.HTTP_200_OK))

        matches_data = []
        for match in matches:
            match_data = MatchSerializer(match).data
            if match.bot_name:  # Aggiungi il nome del bot se presente
                match_data['player2_name'] = match.bot_name
            matches_data.append(match_data)

        LOGGER.info(f'Tris matches retrieved for user: {target_user.username}')
        return create_response(Response({
            'message': 'Tris matches retrieved',
            'data': matches_data
        }, status=status.HTTP_200_OK))

    def post(self, request):
        LOGGER.debug('- TrisGamesView.post()')

        player1_uid = request.data.get('player1_uid')
        player2_uid = request.data.get('player2_uid')
        mode = request.data.get('mode')
        p1_score = request.data.get('p1_score')
        p2_score = request.data.get('p2_score')

        if any(value is None for value in [player1_uid, player2_uid, mode, p1_score, p2_score]):
            LOGGER.warning('Missing required fields')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Missing required fields'}
            ))

        try:
            player1_user = User.objects.get(uid=player1_uid)
            player1, created = Player.objects.get_or_create(user=player1_user, game_type='tris')
            if created:
                LOGGER.info(f'Tris player created for user: {player1_user.username}')

            if player2_uid == 'AM':
                player2 = None
                bot_name = "AM"
            else:
                player2_user = User.objects.get(uid=player2_uid)
                player2, created = Player.objects.get_or_create(user=player2_user, game_type='tris')
                if created:
                    LOGGER.info(f'Tris player created for user: {player2_user.username}')
                bot_name = None

            player1.TOTP += 1
            if player2:
                player2.TOTP += 1

            if p1_score > p2_score:
                player1.TOTW += 1
                winner = 'player1'
                if player2:
                    LOGGER.info(f'{player1.user.username} won against {player2.user.username}')
            elif p1_score < p2_score:
                if player2:
                    player2.TOTW += 1
                    winner = 'player2'
                    LOGGER.info(f'{player2.user.username} won against {player1.user.username}')
                else:
                    winner = 'player2'
                    LOGGER.info(f'{player1.user.username} lost against the bot')

            # Aggiorna le statistiche in base alla modalità
            if mode.lower() == 'local':
                player1.PVPP += 1
                if player2:
                    player2.PVPP += 1
                if p1_score > p2_score:
                    player1.PVPW += 1
                elif p1_score < p2_score and player2:
                    player2.PVPW += 1
            elif mode.lower() == 'tournament':
                player1.TMAP += 1
                if player2:
                    player2.TMAP += 1
                if p1_score > p2_score:
                    player1.TMAW += 1
                elif p1_score < p2_score and player2:
                    player2.TMAW += 1
            elif mode.lower() == 'bot':
                player1.PVEP += 1
                if p1_score > p2_score:
                    player1.PVEW += 1

            # Salva le statistiche aggiornate
            player1.save()
            if player2:
                player2.save()

            # Salva la partita nel database
            match = Match.objects.create(
                player1=player1,
                player2=player2,
                bot_name=bot_name,
                game='tris',
                mode=mode.lower(),
                player1_result=p1_score,
                player2_result=p2_score,
                winner=winner
            )

            match.save()
            player1.save()
            if player2:
                player2.save()

            LOGGER.info('Match saved successfully')
            return create_response(Response(
                status=status.HTTP_201_CREATED,
                data={'message': 'Match saved successfully'}
            ))

        except User.DoesNotExist as e:
            if player1_uid:
                LOGGER.warning(f'User not found for player1_uid: {player1_uid}')
            if player2_uid:
                LOGGER.warning(f'User not found for player2_uid: {player2_uid}')
            return create_response(Response(
                status=status.HTTP_404_NOT_FOUND,
                data={'message': f'User not found: {str(e)}'}
            ))
        except Exception as e:
            LOGGER.error(f'Error saving match: {str(e)}')
            return create_response(Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={'message': 'An error occurred while saving the match'}
            ))

class TrisLeaderboardView(APIView):
    permission_classes = [AllowAny]  # Permette l'accesso a chiunque, senza autenticazione

    def get(self, _):
        LOGGER.debug('- TrisLeaderboardView.get()')
        leaderboard = Player.objects.filter(game_type='tris', TOTP__gt=0).order_by('-TOTW')[:10]  # Prendi i primi 10

        if not leaderboard.exists():
            LOGGER.info('No players found for Tris leaderboard')
            return create_response(Response({
                'message': 'No players found for Tris leaderboard',
                'data': []
            }, status=status.HTTP_200_OK))

        leaderboard_serializer = LeaderboardSerializer(leaderboard, many=True)
        LOGGER.info(f'Tris leaderboard retrieved with {len(leaderboard)} players')
        return create_response(Response({
            'message': 'Tris leaderboard retrieved',
            'data': leaderboard_serializer.data
        }, status=status.HTTP_200_OK))
    
class SearchPlayerView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [BasicAuthentication, SessionAuthentication]

    def get(self, request):
        LOGGER.debug('- SearchPlayerView.get()')

        # Ottieni lo username dai parametri della query
        username = request.query_params.get('username')

        if not username:
            LOGGER.warning('Username is required')
            return create_response(Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={'message': 'Username is required'}
            ))

        # Escludi l'utente autenticato dalla ricerca
        current_user = request.user
        players = User.objects.filter(username__icontains=username).exclude(uid=current_user.uid)

        # Serializza i dati dei giocatori trovati
        players_data = SearchPlayerSerializer(players, many=True).data

        LOGGER.info(f'Players found with username: {username}, count: {len(players_data)}')
        return create_response(Response(
            status=status.HTTP_200_OK,
            data={
                'message': 'Players found',
                'data': players_data
            }
        ))