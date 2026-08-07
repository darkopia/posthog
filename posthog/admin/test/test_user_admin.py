from django.contrib import admin
from django.test import Client, override_settings
from django.urls import include, path

from posthog.test.base import BaseTest

# The admin URLs are only routed when ADMIN_PORTAL_ENABLED (DEBUG/DEMO), so give
# these tests their own urlconf that always mounts the admin + loginas routes.
urlpatterns = [
    path("admin/", include("loginas.urls")),
    path("admin/", admin.site.urls),
]


@override_settings(ROOT_URLCONF="posthog.admin.test.test_user_admin")
class TestUserAdminImpersonationDeepLink(BaseTest):
    def setUp(self):
        super().setUp()
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.client = Client()
        self.client.force_login(self.user)

    def test_email_search_with_reason_redirects_to_user_change_page(self):
        target = self._create_user("customer@example.com")

        response = self.client.get(
            "/admin/posthog/user/", {"q": "customer@example.com", "reason": "Support ticket #1234"}
        )

        assert response.status_code == 302
        assert response.headers["Location"] == (
            f"/admin/posthog/user/{target.pk}/change/?reason=Support+ticket+%231234"
        )

    def test_email_search_is_case_insensitive(self):
        target = self._create_user("customer@example.com")

        response = self.client.get("/admin/posthog/user/", {"q": "Customer@Example.com", "reason": "ticket #1"})

        assert response.status_code == 302
        assert response.headers["Location"].startswith(f"/admin/posthog/user/{target.pk}/change/")

    def test_search_without_reason_shows_changelist(self):
        self._create_user("customer@example.com")

        response = self.client.get("/admin/posthog/user/", {"q": "customer@example.com"})

        # No reason → normal changelist, no redirect to a specific user.
        assert response.status_code == 200

    def test_reason_without_matching_user_shows_changelist(self):
        response = self.client.get("/admin/posthog/user/", {"q": "nobody@example.com", "reason": "ticket #1"})

        assert response.status_code == 200
