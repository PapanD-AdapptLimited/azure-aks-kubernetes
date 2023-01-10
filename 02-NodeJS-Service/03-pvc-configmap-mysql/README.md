

kubectl run -it --rm --image=mysql:5.6 --restart=Never mysql-client -- mysql -h mysql -pdbpassword11

# Delete PV exclusively
kubectl get pv
kubectl delete pv <PV-NAME>