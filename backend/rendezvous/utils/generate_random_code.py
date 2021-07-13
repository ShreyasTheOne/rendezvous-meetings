import string
import random

def generate_random_code():
    """ Generates random unique code for a new meeting

    Returns
    -------
    Response: basestring
        A randomly generate string of the form 'xxx-xxx-xxx'
    """

    # Code contains 3 parts
    parts = [''] * 3
    for i in range(3):
        # k=3 because each part contains 3 characters
        parts[i] = ''.join(random.choices(string.ascii_lowercase, k=3))

    code = '-'.join(parts)
    return code
