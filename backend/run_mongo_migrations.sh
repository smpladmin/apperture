#!/bin/bash

echo "Running migration for mongo db"
source .env && beanie migrate -uri $DB_URI -p mongo_migrations -db apperture_db --distance 1
