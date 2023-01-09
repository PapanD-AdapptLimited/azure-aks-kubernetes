# azure-aks-kubernetes
Azure AKS Kubernetes


docker build -t papanadappt/my-node-app .
docker run -d -p 8081:8081 papanadappt/my-node-app
docker ps
docker stop dcd2125a65be
docker rm -f dcd2125a65be
docker login
docker push papanadappt/my-node-app:latest