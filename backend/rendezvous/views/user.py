from django.db.models import Q

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from rendezvous_authentication.models import User
from rendezvous_authentication.serializers.user import UserSerializer, UserDropdownSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """
        Returns the serializer used to send back data
        """

        use = self.request.query_params.get('for', None)
        if use == 'dropdown':
            return UserDropdownSerializer
        else:
            return UserSerializer

    def get_queryset(self):
        """
        I search the user database for users whose email or name match the search query.

        Returns
        -------
        results: Queryset
            Top 20 results that match the search query
        """

        get_all = self.request.query_params.get('get_all', None)

        if get_all:
            return User.objects.filter(
                Q(is_superuser=False) &
                ~Q(uuid=self.request.user.uuid)
            )

        search = self.request.query_params.get('search', None)
        if not search:
            return User.objects.none()

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
