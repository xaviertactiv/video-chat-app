from django.shortcuts import render

# Create your views here.
""" this script handles the user related processes.
    (auth, user details, etc..)
"""
from rest_framework import parsers, renderers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet

from .serializers import (
    AuthTokenSerializer,
    UserSerializer,
)


class Login(APIView):
    """ user authentication endpoint.
        uses token authentication method
    """
    authentication_classes = ()
    permission_classes = (AllowAny,)
    parser_classes = (parsers.FormParser, parsers.MultiPartParser,
                      parsers.JSONParser)
    render_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer

    def post(self, request):
        """ accepts post data that contains user credentials
            and validates it. Returns a generated token.
        """
        serializer = self.serializer_class(
            data=request.data, request=request)
        serializer.is_valid(raise_exception=True)

        return Response({
            'token': serializer.get_token().key,
            'user_id': serializer.user.id
        }, status=200)


class AuthUser(ViewSet):
    """ auth user endpoint
    """
    serializer_class = UserSerializer

    def get(self, request):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=200)
