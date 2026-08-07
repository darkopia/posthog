from urllib.parse import urlencode

from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserChangeForm as DjangoUserChangeForm
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from posthog.admin.inlines.organization_member_inline import OrganizationMemberInline
from posthog.admin.inlines.totp_device_inline import TOTPDeviceInline
from posthog.api.authentication import password_reset_token_generator
from posthog.models import User


class UserChangeForm(DjangoUserChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # This is a riff on https://github.com/django/django/blob/stable/4.1.x/django/contrib/auth/forms.py#L151-L153.
        # The difference from the Django default is that instead of a form where the _admin_ sets the new password,
        # we have a link to the password reset page which the _user_ can use themselves.
        # This way if some user needs to reset their password and there's a problem with receiving the reset link email,
        # an admin can provide that reset link manually – much better than sending a new password in plain text.
        password_reset_token = password_reset_token_generator.make_token(self.instance)
        self.fields["password"].help_text = (
            "Raw passwords are not stored, so there is no way to see this user’s password, but you can send them "
            f'<a target="_blank" href="/reset/{self.instance.uuid}/{password_reset_token}">this password reset link</a> '
            "(it only works when logged out)."
        )


class UserAdmin(DjangoUserAdmin):
    """Define admin model for custom User model with no email field."""

    form = UserChangeForm
    change_password_form = None  # This view is not exposed in our subclass of UserChangeForm
    # Extends loginas/change_form.html to also pre-fill the "Log in as" reason from a ?reason= param.
    change_form_template = "admin/posthog/user/change_form.html"

    inlines = [OrganizationMemberInline, TOTPDeviceInline]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "id",
                    "email",
                    "password",
                    "current_organization",
                    "is_email_verified",
                    "pending_email",
                    "strapi_id",
                )
            },
        ),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        (_("Toolbar authentication"), {"fields": ("temporary_token",)}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
    list_display = (
        "id",
        "email",
        "first_name",
        "last_name",
        "current_team_link",
        "current_organization_link",
        "is_staff",
    )
    list_display_links = ("id", "email")
    list_filter = ("is_staff", "is_active", "groups")
    list_select_related = ("current_team", "current_organization")
    search_fields = ("email", "first_name", "last_name")
    readonly_fields = ["id", "current_team", "current_organization"]
    ordering = ("email",)

    def changelist_view(self, request, extra_context=None):
        # Deep-link straight to a single user's change page — where the loginas "Log in as"
        # button and its reason field live — from tools that only know the customer's email,
        # not their user ID (e.g. our support desk). When an impersonation `reason` is passed
        # alongside a search `q` that resolves to exactly one user by email, redirect to that
        # user and carry the reason through so it can be pre-filled on the change page.
        # `email` is unique, so an exact match identifies the user unambiguously. Without a
        # `reason`, the normal changelist (search results) is shown as before.
        reason = request.GET.get("reason")
        query = request.GET.get("q")
        if reason and query and self.has_view_or_change_permission(request):
            match = User.objects.filter(email__iexact=query.strip()).first()
            if match is not None:
                change_url = reverse("admin:posthog_user_change", args=[match.pk])
                return redirect(f"{change_url}?{urlencode({'reason': reason})}")
        return super().changelist_view(request, extra_context=extra_context)

    def current_team_link(self, user: User):
        if not user.team:
            return "–"

        return format_html(
            '<a href="/admin/posthog/team/{}/change/">{}</a>',
            user.team.pk,
            user.team.name,
        )

    def current_organization_link(self, user: User):
        if not user.organization:
            return "–"

        return format_html(
            '<a href="/admin/posthog/organization/{}/change/">{}</a>',
            user.organization.pk,
            user.organization.name,
        )
