from django.db import models
import uuid


class Base(models.Model):
    """
    This abstract root model should be inherited by all models.
    It adds common features like uuid and time of creation.
    """

    datetime_created = models.DateTimeField(auto_now_add=True)
    datetime_modified = models.DateTimeField(auto_now=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    class Meta:
        abstract = True
