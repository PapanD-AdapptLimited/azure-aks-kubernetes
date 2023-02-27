# Create
./network cluster init

./network up


# Read the CA's TLS certificate from the cert-manager CA secret
kubectl -n $NS get secrets ${CA_NAME}-tls-cert -o json | jq -r .data.\"ca.crt\" | base64 -d
kubectl -n test-network2 get secrets org0-ca-tls-cert -o json | jq -r .data.\"ca.crt\" | base64 -d


kubectl -n $NS exec -it org0-ca-5899b96f96-s8c5n -- /bin/sh


# Delete
./network down
./network cluster clean