# Generated by Django 4.2.11 on 2024-05-23 19:13

from django.db import migrations, models


def backfill_invite_level(apps, schema_editor):
    OrganizationInvite = apps.get_model("posthog", "organizationinvite")
    for invite in OrganizationInvite.objects.all():
        invite.level = 1
        invite.save()


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0416_survey_internal_targeting_flag"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="organizationmembership",
            name="only_one_owner_per_organization",
        ),
        migrations.AddField(
            model_name="organizationinvite",
            name="level",
            field=models.PositiveSmallIntegerField(
                choices=[(1, "member"), (8, "administrator"), (15, "owner")], default=1, null=True, blank=True
            ),
        ),
        migrations.RunSQL(
            "update posthog_organizationinvite set level = 1",
            reverse_sql="update posthog_organizationinvite set level = NULL",
        ),
        migrations.RunSQL(
            "ALTER TABLE posthog_organizationinvite ALTER COLUMN level SET NOT NULL -- existing-table-constraint-ignore",
            reverse_sql="ALTER TABLE posthog_organizationinvite ALTER COLUMN level DROP NOT NULL",
        ),
        migrations.AlterField(
            model_name="organizationinvite",
            name="level",
            field=models.PositiveSmallIntegerField(
                choices=[(1, "member"), (8, "administrator"), (15, "owner")], default=1, null=False, blank=False
            ),
        ),
    ]
