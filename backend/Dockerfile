FROM python:3.9 as base

WORKDIR /code
EXPOSE 8001

FROM base as poetry
RUN pip install poetry

FROM poetry as dev
COPY . /code/
RUN poetry install
RUN poetry config virtualenvs.in-project false
CMD poetry run uvicorn server:app --reload --host 0.0.0.0 --port 8001

FROM poetry as tests
COPY . /code/
RUN poetry install
RUN poetry run pytest
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM base as production
COPY --from=tests /code/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code/
CMD uvicorn server:app --host 0.0.0.0 --port 8001
