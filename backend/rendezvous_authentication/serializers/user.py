from rest_framework.serializers import ModelSerializer
from rendezvous_authentication.models import User


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            'uuid',
            'full_name',
            'profile_picture',
            'email'
        ]
        read_only_fields = ['uuid',]
