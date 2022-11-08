#!/bin/bash

set -e
EXIT_CODE=0

services=( backend frontend data_processor scheduler )
for i in "${services[@]}"
do
	echo "Pulling .env for $i" && cd $i && /bin/bash getenv.sh || true && cd ..
done

echo "Finished pulling .envs"
pattern=$(printf "%-100s" "=")
echo "${pattern// /=}"

services=( backend scheduler infra data_processor )
for i in "${services[@]}"
do
	echo "Updating poetry env for $i" && cd $i && poetry install || EXIT_CODE=$((EXIT_CODE+1)) && cd ..
done

echo "Finished updating poetry envs with Exit Code: $EXIT_CODE"
