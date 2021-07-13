from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.core.mail import EmailMessage


@shared_task(name='send_email')
def send_email(target_email_address, subject, body, from_email="Rendezvous Robin"):
    """ Push email-send requests to the message-broker queue

    Parameters
    ----------
    target_email_address: baseString
        Email address of the user to which the email should be sent
    subject: basestring
        Subject of the email to be sent
    body: basestring
        Body of the email to be sent
    from_email: basestring
        Name of the sender of the email (in this case Rendezvous)


    Returns
    -------
    Response: function
        The function to be called by the message broker to send the email for each user
    """

    email_message = EmailMessage(
        subject=subject,
        body=body,
        from_email=from_email,
        to=[target_email_address]
    )
    email_message.content_subtype = "html"

    return email_message.send()
