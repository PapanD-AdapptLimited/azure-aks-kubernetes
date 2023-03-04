# azure-aks-kubernetes
Azure AKS Kubernetes


docker build -t papanadappt/my-node-app:0.0.2 .
docker run -d -p 8081:8081 --name myapp papanadappt/my-node-app:0.0.2
docker ps
docker stop dcd2125a65be
docker rm -f dcd2125a65be
docker login
docker push papanadappt/my-node-app:0.0.2

kind create cluster --name kind-nodejs
kind get clusters
kubectl cluster-info --context kind-nodejs
kind delete cluster



docker rmi -f $(docker images papanadappt/my-node-app -q)
export TAG=0.1.1-secret
docker build --platform=linux/amd64 -t papanadappt/my-node-app:${TAG} .
docker push papanadappt/my-node-app:${TAG}

docker run -d -p 8081:8081 --name myapp papanadappt/my-node-app:${TAG}
docker rm -f myapp







--platform=linux/amd64



fca53bc43807c44379d142c
export AKS_PERS_STORAGE_ACCOUNT_NAME=fca53bc43807c44379d142c
export STORAGE_KEY=FJuH5wc73t5C0uo/DNyZO2xTYV+tsavWQi/R2wZWF1lsajpaRb0lufkKlrNGisLMoL2MHBWn6MpS+AStKe1/cQ==

kubectl -n test-storage create secret generic azure-secret --from-literal=azurestorageaccountname=$AKS_PERS_STORAGE_ACCOUNT_NAME --from-literal=azurestorageaccountkey=$STORAGE_KEY