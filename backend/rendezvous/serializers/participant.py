from rest_framework import serializers

from rendezvous.models import Participant

from rendezvous_authentication.serializers.user import UserSerializer


class ParticipantUsersSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=True)

    class Meta:
        model = Participant
        fields = ['user', ]
        read_only_fields = ['user', ]
