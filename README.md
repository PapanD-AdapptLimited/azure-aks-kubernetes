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


export TAG=0.0.5
docker build --platform=linux/amd64 -t papanadappt/my-node-app:${TAG} .
docker run -d -p 8081:8081 --name myapp papanadappt/my-node-app:${TAG}
docker rm -f myapp
docker push papanadappt/my-node-app:${TAG}


--platform=linux/amd64