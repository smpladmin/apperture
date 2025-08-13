#!/bin/bash

SERVICES=(
  "backend"
  "frontend"
  "airflow"
  "data_processor"
  "scheduler"
  "alertmanager"
  "events_producer"
  "events_consumer"
  "cdc_consumer"
  "event_logs_producer"
  "event_logs_consumer"
  "event_logs_consumer_v2"
  "events_config_consumer"
  "event_service_bus_consumer_producer"
)

# Create ECR repositories
for service in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name $service \
    --region ap-south-1 \
    --image-scanning-configuration scanOnPush=true
done
