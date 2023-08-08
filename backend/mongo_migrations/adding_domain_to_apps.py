from typing import List, Union

from domain.apperture_users.models import AppertureUser
from domain.apps.models import App
from utils.mail import GENERIC_EMAIL_DOMAINS


def parse_domain_from_email(email: str) -> Union[str, None]:
    try:
        domain = email.split("@")[-1]
        if domain not in GENERIC_EMAIL_DOMAINS:
            return domain
        return None
    except Exception as e:
        return None


async def update_collection_on_startup(collection: List[App]):
    for app in collection:
        app.org_access = False
        user = await AppertureUser.get(app.user_id)
        app.domain = parse_domain_from_email(email=user.email)
        await app.replace()
