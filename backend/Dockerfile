FROM python:3.9-slim as base
WORKDIR /code
EXPOSE 8001

FROM base as deps
RUN apt-get update \
  && apt-get install gcc -y \
  && apt-get clean
WORKDIR /code
COPY pyproject.toml ./
COPY poetry.lock ./
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install poetry
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

FROM base as dev
WORKDIR /code
ENV FASTAPI_ENV=development
COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
CMD uvicorn server:app --reload --host 0.0.0.0 --port 8001

FROM base as production
WORKDIR /code
ENV FASTAPI_ENV=production
COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
CMD uvicorn server:app --host 0.0.0.0 --port 8001
