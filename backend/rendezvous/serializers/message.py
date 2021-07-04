from rest_framework.serializers import ModelSerializer, CharField
from rendezvous_authentication.serializers.user import UserSerializer
from rendezvous.models import MeetingMessage, PersonalMessage


class MeetingMessageSerializer(ModelSerializer):
    sender = UserSerializer()

    class Meta:
        model = MeetingMessage
        fields = [
            'content',
            'sender',
            'send_time'
        ]
        read_only_fields = ['id', ]


class PersonalMessageSerializer(ModelSerializer):
    sender = UserSerializer()

    class Meta:
        model = PersonalMessage
        fields = [
            'content',
            'sender',
            'send_time'
        ]
        read_only_fields = ['id', ]
