FROM python:3.9-slim as base
WORKDIR /code

FROM base as deps
RUN apt-get update \
    && apt-get install gcc -y \
    && apt-get clean
WORKDIR /code
COPY pyproject.toml ./
COPY poetry.lock ./
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
#RUN pip install poetry
#RUN pip install --no-cache-dir --upgrade "poetry>=1.2.0"
RUN pip install --no-cache-dir --upgrade "poetry>=1.2.0" && \
    poetry self add poetry-plugin-export

RUN poetry --version && poetry --help
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

FROM base as production
WORKDIR /code
COPY --from=deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
CMD python main.py
