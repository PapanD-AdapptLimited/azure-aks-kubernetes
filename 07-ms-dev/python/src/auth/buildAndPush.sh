#!/bin/bash
set -x

PROFILE=papanadappt
NAME="ms-k8s-ard64-auth"
TAG=latest

# Remove docker image containers
docker rmi -f $(docker images $PROFILE/$NAME -q)

# Build docker containers
docker build -t $PROFILE/$NAME:${TAG} .
docker push $PROFILE/$NAME:${TAG}

# Bring up docker containers
# docker-compose -f ../docker-compose.yaml up -d users 
