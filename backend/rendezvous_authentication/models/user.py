import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from rendezvous_authentication.defaults import PROFILE_PICTURE


class User(AbstractUser):

    full_name = models.CharField(
        max_length=255,
        blank=False,
        null=False
    )

    # Profile picture is URL we get from OAuth services
    profile_picture = models.TextField(
        blank=False,
        null=False,
        default=PROFILE_PICTURE
    )

    email = models.EmailField(
        blank=False,
        null=False,
        unique=True
    )

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    def __str__(self):
        return f"User: {self.full_name}"

    def get_full_name(self):
        return self.full_name
