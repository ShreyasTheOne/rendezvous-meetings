from rest_framework import serializers
from rendezvous_authentication.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'uuid',
            'full_name',
            'profile_picture',
            'email'
        ]
        read_only_fields = ['uuid', ]


class UserImageSerializer(serializers.ModelSerializer):
    avatar = serializers.BooleanField(default=True)
    src = serializers.CharField(source='profile_picture')

    class Meta:
        model = User
        fields = [
            'avatar',
            'src',
        ]


class UserDropdownSerializer(serializers.ModelSerializer):
    key = serializers.CharField(source='email')
    text = serializers.CharField(source='get_dropdown_text')
    value = serializers.CharField(source='email')
    image = serializers.SerializerMethodField()

    def get_image(self, user):
        return UserImageSerializer(user).data

    class Meta:
        model = User
        fields = [
            'key',
            'text',
            'value',
            'image',
        ]
        read_only_fields = [
            'key',
            'text',
            'value'
        ]
