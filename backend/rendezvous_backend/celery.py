import os
from django.conf import settings
from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rendezvous_backend.settings')

app = Celery('rendezvous_backend')

app.config_from_object(settings, namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()
