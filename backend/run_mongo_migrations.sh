#!/bin/bash

echo "Running migration for mongo db"
source .env && beanie migrate -uri $DB_URI -p mongo_migrations -db $DB_NAME --distance 1
