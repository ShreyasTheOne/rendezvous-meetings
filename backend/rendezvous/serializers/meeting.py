from rest_framework.serializers import ModelSerializer, CharField
from rendezvous_authentication.serializers.user import UserSerializer, UserDropdownSerializer
from rendezvous.models import Meeting


class MeetingShallowSerializer(ModelSerializer):
    host = UserSerializer()

    class Meta:
        model = Meeting
        fields = [
            'id',
            'code',
            'title',
            'description',
            'host',
            'start_time'
        ]
        read_only_fields = ['id', ]


class MeetingVerboseSerializer(ModelSerializer):
    host = UserSerializer()
    invitees = UserSerializer(many=True)
    joining_link = CharField(source='get_joining_link')
    scheduled_start_time = CharField(source='get_scheduled_time_str')

    class Meta:
        model = Meeting
        fields = [
            'id',
            'host',
            'invitees',
            'code',
            'title',
            'joining_link',
            'description',
            'scheduled_start_time',
        ]
        read_only_fields = ['id', ]


class MeetingEmailSerializer(ModelSerializer):
    host_name = CharField(source='get_host_name')
    joining_link = CharField(source='get_joining_link')
    # scheduled_start_time = CharField(source='get_scheduled_time_formatted')
    scheduled_start_time = CharField(source='get_scheduled_time_str')

    class Meta:
        model = Meeting
        fields = [
            'joining_link',
            'code',
            'title',
            'description',
            'host_name',
            'scheduled_start_time'
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
