from rest_framework.serializers import CharField
from rest_framework.serializers import ModelSerializer
from rendezvous.models import Whiteboard


class WhiteboardSerializer(ModelSerializer):
    meeting = CharField()
    class Meta:
        model = Whiteboard
        fields = [
            'meeting',
            'elements',
        ]
        read_only_fields = ['meeting', 'elements']
