import os
import json
import base64
import requests

from django.contrib.auth import login

from rest_framework import status
from rest_framework.response import Response

from rendezvous_authentication.models import User
from rendezvous_authentication.serializers.user import UserSerializer
from rendezvous_authentication.utils.validate import validate_email
from rendezvous_authentication.utils.oauth.update_or_create_user import update_or_create_user


def google_oauth_login(request):
    """ User used google for authentication

    Send POST request to google to get encrypted JWT Token in response
    Decode JWT token to get user data and log the user into our app

    ...

    Parameters
    ----------
    request: object
        HTTP Request Object containing user object and request data.

    Returns
    -------
    Response: object
        rest_framework Response object containing response data and status code.
    """

    data = request.data
    code = data.get('code', None)

    # Get user data using code
    token_endpoint = "https://oauth2.googleapis.com/token"
    token_request_data = {
        'code': code,
        'client_id': os.environ.get("GOOGLE_CLIENT_ID"),
        'client_secret': os.environ.get("GOOGLE_CLIENT_SECRET"),
        'redirect_uri': os.environ.get("FRONTEND_REDIRECT_URI"),
        'grant_type': 'authorization_code',
    }

    token_response = requests.post(
        url=token_endpoint,
        data=token_request_data
    ).json()

    if token_response is None:
        response_data = {
            'error': 'Invalid code.'
        }
        return Response(
            response_data, status=status.HTTP_401_UNAUTHORIZED
        )

    token_error = token_response.get('error', None)
    id_token_jwt = token_response.get('id_token', None)

    # If error in retrieving user data, inform user
    if token_error or id_token_jwt is None:
        response_data = {
            'error': 'Invalid code'
        }
        return Response(
            response_data,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Retrieve user data from encrypted jwt token
    content = id_token_jwt.split('.')[1]
    padding = len(str(content)) % 4
    content = content + padding * "="

    content_bytes = base64.b64decode(content)
    content_ascii = content_bytes.decode('ascii')
    user_data = json.loads(content_ascii)

    user_email = user_data.get('email', None)
    user_name = user_data.get('name', None)
    user_picture = user_data.get('picture', None)

    if not validate_email(user_email):
        response_data = {
            'error': 'User email required.'
        }
        return Response(
            response_data, status=status.HTTP_401_UNAUTHORIZED
        )
    if user_name is None:
        response_data = {
            'error': 'User name required.'
        }
        return Response(
            response_data, status=status.HTTP_401_UNAUTHORIZED
        )

    # Update or create user
    user = update_or_create_user(user_email, user_name, user_picture)

    # Log the user in
    login(request, user)

    # Send user data in response
    user_data = UserSerializer(user).data
    response_data = {
        'status': 'Successfully logged in',
        'user': user_data,
    }
    return Response(
        response_data,
        status=status.HTTP_200_OK
    )
