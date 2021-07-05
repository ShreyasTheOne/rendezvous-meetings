from django.contrib import admin

from rendezvous.models import *

# Register your models here.
admin.site.register(Meeting)
admin.site.register(Participant)
admin.site.register(MeetingMessage)
admin.site.register(PersonalMessage)
