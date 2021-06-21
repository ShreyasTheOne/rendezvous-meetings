from django.db.models import Q

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from rendezvous_authentication.models import User
from rendezvous_authentication.serializers.user import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_queryset(self):
        """
        I search the user database for users whose email or name match the search query.

        Returns
        -------
        results: Queryset
            Top 20 results that match the search query
        """

        search = self.request.query_params.get('search', None)

        try:
            results = User.objects.filter(
                (
                    Q(full_name__icontains=search) |
                    Q(email__icontains=search)
                )
                & Q(is_superuser=False)
                & ~Q(uuid=self.request.user.uuid)
            ).order_by('full_name', 'email')[:20]
        except:
            results = User.objects.all().order_by('full_name', 'email')[:20]

        return results
