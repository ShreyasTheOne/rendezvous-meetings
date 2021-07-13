from __future__ import absolute_import, unicode_literals
from celery import shared_task
from rendezvous.tasks.email import send_email


@shared_task(name='send_meeting_invite_notifications')
def send_meeting_invite_notifications(meeting, user_emails):
    """ Craft and send email to notify user about new meeting invitation

    Parameters
    ----------
    meeting: Meeting object
        A meeting object containing:
            - title
            - code
            - description
            - joining_link
            - scheduled_start_time
            - host_name
        of the meeting which the email is notifying about
    user_emails: list
        A list of email addresses of all the users invited to the meeting,
        to whom the invitations will be sent

    """

    title = meeting.get('title')
    code = meeting.get('code')
    description = meeting.get('description')
    joining_link = meeting.get('joining_link')
    scheduled_start_time = meeting.get('scheduled_start_time')
    host_name = meeting.get('full_name')

    for email in user_emails:
        target_email_address = email

        html_content = \
            f"""
            <html>
                <body>
                    <h1>{title}</h1>
        
                    <p> <strong> Meeting Code:</strong> {code} (<a href="{joining_link}">Joining Link</a>)</p>
        
                    <h3>Description</h3>
                    <p>{description}</p>
        
                    <h3>Scheduled Start Time</h3>
                    <p>{scheduled_start_time}</p>
        
                    <h3>Host</h3>
                    <p>{host_name}</p>
                </body>
            </html>
            """

        send_email(
            target_email_address=target_email_address,
            subject="You have been invited to a meeting.",
            body=html_content,
        )
