# azure-aks-kubernetes
Azure AKS Kubernetes


docker build -t papanadappt/my-node-app .
docker run -d -p 8081:8081 papanadappt/my-node-app
docker ps
docker stop [Container Name]
docker rm [Container Name]
docker login
docker push my-node-app:latest