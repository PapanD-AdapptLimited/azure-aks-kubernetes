#!/bin/bash
set -x

PROFILE=papanadappt
NAME=extcc-horus-ts-1
# TAG=1.0.0

# Remove docker image containers
docker rmi -f $(docker images $PROFILE/$NAME -q)

# Build docker containers
docker build -t $PROFILE/$NAME .
docker push $PROFILE/$NAME

# Bring up docker containers
# docker-compose -f ../docker-compose.yaml up -d users 
