from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.core.mail import EmailMessage


@shared_task(name='send_email')
def send_email(target_email_address, subject, body, from_email="Rendezvous Robin"):
    """
    Push email-send requests to the message-broker queue
    """

    email_message = EmailMessage(
        subject=subject,
        body=body,
        from_email=from_email,
        to=[target_email_address]
    )
    email_message.content_subtype = "html"

    return email_message.send()
