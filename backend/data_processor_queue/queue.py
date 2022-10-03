from rq import Queue
from rq_scheduler import Scheduler
from redis import Redis

from settings import apperture_settings

settings = apperture_settings()

redis_conn = Redis(host=settings.redis_host, password=settings.redis_password)
dpq = Queue("apperture_default", connection=redis_conn)
notification_queue = Queue("apperture_notification", connection=redis_conn)
scheduler = Scheduler("apperture_default", connection=redis_conn)
