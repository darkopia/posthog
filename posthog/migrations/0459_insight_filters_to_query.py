# Generated by Django 4.2.14 on 2024-08-22 12:23
import logging

from datetime import datetime
from django.db import migrations, connection
from django.db.models import Q

from posthog.hogql_queries.legacy_compatibility.filter_to_query import filter_to_query
from posthog.models import Insight
from posthog.schema import InsightVizNode

logger = logging.getLogger(__name__)


def migrate_insight_filters_to_query(apps, schema_editor):
    insights = Insight.objects.filter(Q(filters__insight__isnull=False) & Q(query__kind__isnull=True))
    migrated_at = datetime.now()

    for insight in insights.iterator(chunk_size=100):
        try:
            source = filter_to_query(insight.filters)
            query = InsightVizNode(source=source)
            insight.query = query.model_dump()

            # add a migrated_at as filter, so that we can find migrated insights for rolling back
            insight.filters["migrated_at"] = str(migrated_at)
            insight.save()
        except Exception:
            logger.error(f"Error converting insight with id {insight.pk}")  # noqa: TRY400


def rollback_insight_filters_to_query(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE posthog_dashboarditem
            SET query = NULL, filters = filters - 'migrated_at'
            WHERE filters->>'migrated_at' IS NOT NULL
            """
        )


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0458_alter_insightviewed_team_alter_insightviewed_user"),
    ]

    operations = [
        migrations.RunPython(migrate_insight_filters_to_query, rollback_insight_filters_to_query),
    ]
