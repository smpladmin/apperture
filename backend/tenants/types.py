from collections import namedtuple

Tenant = namedtuple("Tenant", ["app_id", "provider", "email", "version"])
Tokens = namedtuple("Tokens", ["access_token", "refresh_token"])
