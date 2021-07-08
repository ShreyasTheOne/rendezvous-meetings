from datetime import datetime, timedelta


def now():
    """
    Returns the current time in Indian Standard Time
    """

    return datetime.now() + timedelta(minutes=330)


def format_semantic_time_to_datetime(time):
    """
    Convert the time from the format set by Semantic-UI date picker
    to a python datetime object
    """

    return datetime.strptime(time, "%d-%m-%Y %H:%M")