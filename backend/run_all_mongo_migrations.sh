#!/bin/bash

set -e
EXIT_CODE=0

echo $1
echo $2

# Check if the MongoDB URI is provided
if [ -z "${1}" ]
then
    echo "Error: MongoDB URI is not provided."
    echo "Usage: $0 <1>"
    exit 1
fi

if [ "${2}" == "backward" ]
then
    echo "Executing All Backward Migrations---"
    beanie migrate -uri $1 -p mongo_migrations -db apperture_db --backward
else
    echo "Executing All Forward Migrations---"
    beanie migrate -uri $1 -p mongo_migrations -db apperture_db
fi
