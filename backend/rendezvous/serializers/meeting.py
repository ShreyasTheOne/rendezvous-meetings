from rest_framework.serializers import ModelSerializer, CharField
from rendezvous_authentication.serializers.user import UserSerializer, UserDropdownSerializer
from rendezvous.models import Meeting


class MeetingShallowSerializer(ModelSerializer):
    invitees = UserSerializer(many=True)
    scheduled_start_time = CharField(source='get_scheduled_time_str')

    class Meta:
        model = Meeting
        fields = [
            'id',
            'code',
            'title',
            'description',
            'invitees',
            'scheduled_start_time',
        ]
        read_only_fields = ['id', ]


class MeetingCreatedSerializer(ModelSerializer):
    invitees = UserDropdownSerializer(many=True)
    scheduled_start_time = CharField(source='get_scheduled_time_str')

    class Meta:
        model = Meeting
        fields = [
            'id',
            'code',
            'title',
            'description',
            'invitees',
            'scheduled_start_time',
        ]
        read_only_fields = [
            'id',
            'code',
            'title',
            'description',
            'invitees',
            'scheduled_start_time',
        ]
