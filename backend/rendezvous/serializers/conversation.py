from rest_framework.serializers import ModelSerializer, SerializerMethodField

from rendezvous.models import Meeting
from rendezvous.utils.get_last_message_from_conversation import get_last_message_from_conversation

from rendezvous_authentication.serializers.user import UserDropdownSerializer


class ConversationSerializer(ModelSerializer):
    participants = UserDropdownSerializer(many=True)
    last_message = SerializerMethodField()

    def get_last_message(self, obj):
        return get_last_message_from_conversation(obj)

    class Meta:
        model = Meeting
        fields = [
            'id',
            'title',
            'participants',
            'last_message',
            'datetime_modified'
        ]
        read_only_fields = ['id', ]
