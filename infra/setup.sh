#!/bin/bash

export USE_HOSTNAME=$1
echo $USE_HOSTNAME > /etc/hostname
hostname -F /etc/hostname
apt-get update
curl -fsSL get.docker.com -o get-docker.sh
CHANNEL=stable sh get-docker.sh
rm get-docker.sh
