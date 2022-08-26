from datetime import datetime
from unittest.mock import patch

import pytz
from django.utils import timezone
from rest_framework import status

from posthog.models import Annotation, Insight, Organization, Team, User
from posthog.test.base import APIBaseTest


class TestAnnotation(APIBaseTest):
    @patch("posthog.api.annotation.report_user_action")
    def test_retrieving_annotation(self, mock_capture):
        Annotation.objects.create(
            organization=self.organization, team=self.team, created_at="2020-01-04T12:00:00Z", content="hello world!",
        )

        # Annotation creation is not reported to PostHog because it has no created_by
        mock_capture.assert_not_called()

        response = self.client.get(f"/api/projects/{self.team.id}/annotations/").json()
        self.assertEqual(len(response["results"]), 1)
        self.assertEqual(response["results"][0]["content"], "hello world!")

    @patch("posthog.api.annotation.report_user_action")
    def test_creating_and_retrieving_annotations_by_insight(self, mock_capture):
        insight = Insight.objects.create(team=self.team, name="Pageviews this week", last_refresh=timezone.now(),)
        Annotation.objects.create(
            organization=self.organization,
            team=self.team,
            created_by=self.user,
            content="hello",
            dashboard_item=insight,
            scope=Annotation.Scope.INSIGHT,
        )
        response = self.client.get(f"/api/projects/{self.team.id}/annotations/?dashboardItemId={insight.id}").json()

        self.assertEqual(len(response["results"]), 1)
        self.assertEqual(response["results"][0]["content"], "hello")

        # Assert analytics is sent
        mock_capture.assert_called_once_with(
            self.user, "annotation created", {"scope": "dashboard_item", "date_marker": None},
        )

    def test_query_annotations_by_datetime(self):
        Annotation.objects.create(
            organization=self.organization,
            team=self.team,
            created_by=self.user,
            content="hello_early",
            created_at="2020-01-04T13:00:01Z",
        )
        Annotation.objects.create(
            organization=self.organization,
            team=self.team,
            created_by=self.user,
            content="hello_later",
            created_at="2020-01-06T13:00:01Z",
        )
        response = self.client.get(f"/api/projects/{self.team.id}/annotations/?before=2020-01-05").json()
        self.assertEqual(len(response["results"]), 1)
        self.assertEqual(response["results"][0]["content"], "hello_early")

        response = self.client.get(f"/api/projects/{self.team.id}/annotations/?after=2020-01-05").json()
        self.assertEqual(len(response["results"]), 1)
        self.assertEqual(response["results"][0]["content"], "hello_later")

    def test_org_scoped_annotations_are_returned_between_projects(self):
        second_team = Team.objects.create(organization=self.organization, name="Second team")
        Annotation.objects.create(
            organization=self.organization,
            team=second_team,
            created_by=self.user,
            content="Cross-project annotation!",
            scope=Annotation.Scope.ORGANIZATION,
        )

        response = self.client.get(f"/api/projects/{self.team.id}/annotations/").json()

        self.assertEqual(len(response["results"]), 1)
        self.assertEqual(response["results"][0]["content"], "Cross-project annotation!")

    def test_cannot_fetch_annotations_of_org_user_does_not_belong_to(self):
        separate_org, _, separate_team = Organization.objects.bootstrap(None, name="Second team")
        Annotation.objects.create(
            organization=separate_org,
            team=separate_team,
            content="Intra-project annotation!",
            scope=Annotation.Scope.PROJECT,
        )
        Annotation.objects.create(
            organization=separate_org,
            team=separate_team,
            content="Cross-project annotation!",
            scope=Annotation.Scope.ORGANIZATION,
        )

        response_1 = self.client.get(f"/api/projects/{separate_team.id}/annotations/")

        self.assertEqual(response_1.status_code, 403)
        self.assertEqual(response_1.json(), self.permission_denied_response("You don't have access to the project."))

        response_2 = self.client.get(f"/api/projects/{self.team.id}/annotations/")

        self.assertEqual(response_2.status_code, 200)
        self.assertEqual(response_2.json()["results"], [])

    @patch("posthog.api.annotation.report_user_action")
    def test_creating_annotation(self, mock_capture):
        team2 = Organization.objects.bootstrap(None)[2]

        self.client.force_login(self.user)

        response = self.client.post(
            f"/api/projects/{self.team.id}/annotations/",
            {
                "content": "Marketing campaign",
                "scope": "organization",
                "date_marker": "2020-01-01T00:00:00.000000Z",
                "team": team2.pk,  # make sure this is set automatically
            },
        )
        date_marker: datetime = datetime(2020, 1, 1, 0, 0, 0).replace(tzinfo=pytz.UTC)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        instance = Annotation.objects.get(pk=response.json()["id"])
        self.assertEqual(instance.content, "Marketing campaign")
        self.assertEqual(instance.scope, "organization")
        self.assertEqual(instance.date_marker, date_marker)
        self.assertEqual(instance.team, self.team)

        # Assert analytics are sent
        mock_capture.assert_called_once_with(
            self.user, "annotation created", {"scope": "organization", "date_marker": date_marker},
        )

    @patch("posthog.api.annotation.report_user_action")
    def test_updating_annotation(self, mock_capture):
        test_annotation = Annotation.objects.create(
            organization=self.organization,
            team=self.team,
            created_by=self.user,
            created_at="2020-01-04T12:00:00Z",
            content="hello world!",
        )
        mock_capture.reset_mock()  # Disregard the "annotation created" call

        self.client.force_login(self.user)

        response = self.client.patch(
            f"/api/projects/{self.team.id}/annotations/{test_annotation.pk}/",
            {"content": "Updated text", "scope": "organization"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        test_annotation.refresh_from_db()
        self.assertEqual(test_annotation.content, "Updated text")
        self.assertEqual(test_annotation.scope, "organization")
        self.assertEqual(test_annotation.date_marker, None)

        # Assert analytics are sent
        mock_capture.assert_called_once_with(
            self.user, "annotation updated", {"scope": "organization", "date_marker": None},
        )

    def test_deleting_annotation(self):
        new_user = User.objects.create_and_join(self.organization, "new_annotations@posthog.com", None)

        instance = Annotation.objects.create(organization=self.organization, team=self.team, created_by=self.user)
        self.client.force_login(new_user)

        with patch("posthog.mixins.report_user_action"):
            response = self.client.delete(f"/api/projects/{self.team.id}/annotations/{instance.pk}/")

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Annotation.objects.filter(pk=instance.pk).exists())
