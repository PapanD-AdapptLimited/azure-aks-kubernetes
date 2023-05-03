# STEP 01
## Open Example1 Pod for inspection perpose
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- /bin/bash

# STEP 02
# Copy Chaincode Files/Folder to Remove Cluster & Verify that all the CLI's has the version.
kubectl -n $NS cp ./chaincode/extcc-horus-ts $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/mnt/azure/files/chaincode/extcc-horus-ts-1

ls -la /opt/gopath/src/github.com/extcc-horus-ts-1/extcc-horus-ts/



# STEP 02
# Executel this code in each of the CLI's 
#
# ibm | oracle
#

export org=oracle
export peer=peer
export cc_name=extcc-horus-ts-1
# export cc_tag=1.0.2
export cc_label=${cc_name}
export cc_archive=/opt/gopath/src/github.com/extcc-horus-ts-1/extcc-horus-ts/${cc_name}.tgz

export cc_folder=$(dirname $cc_archive)
export archive_name=$(basename $cc_archive)

echo "Packaging ccaas chaincode ${cc_label}"

mkdir -p ${cc_folder}

export cc_address="${org}${peer}-ccaas-${cc_name}:9999"

cat << EOF > ${cc_folder}/connection.json
{
  "address": "${cc_address}",
  "dial_timeout": "10s",
  "tls_required": false,
  "client_auth_required": false,
  "client_key": "-----BEGIN EC PRIVATE KEY----- ... -----END EC PRIVATE KEY-----",
  "client_cert": "-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----",
  "root_cert": "-----BEGIN CERTIFICATE---- ... -----END CERTIFICATE-----"
}
EOF

cat << EOF > ${cc_folder}/metadata.json
{
  "path":"",
  "type": "ccaas",
  "label": "${cc_label}"
}
EOF

tar -C ${cc_folder} -zcf ${cc_folder}/code.tar.gz connection.json
tar -C ${cc_folder} -zcf ${cc_archive} code.tar.gz metadata.json

rm ${cc_folder}/code.tar.gz

cp ${cc_archive} .

sleep 1

peer lifecycle chaincode install ${cc_name}.tgz



# ################################## #
# lifecycle chaincode queryinstalled #
# ################################## #

peer lifecycle chaincode calculatepackageid /opt/gopath/src/github.com/extcc-horus-ts-1/extcc-horus-ts/${cc_name}.tgz

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'


Package ID: extcc-horus-ts-1:e6c8a3bc2a64f5c4bfdcb003fba9c640c04df752a3b0581c9966bbee9534b5d5, Label: extcc-horus-ts-1
Package ID: extcc-horus-ts-1:13d2522dfff5139b8714f7e662208f1657a4e9ef913f727070677466687935c9, Label: extcc-horus-ts-1
Package ID: extcc-horus-ts-1:0e59eef6001c1999cf417efefc88f714f9beafabbab388b4f33793a41602beb1, Label: extcc-horus-ts-1
Package ID: extcc-horus-ts-1:d2f9aba94f859b5431e69c5d9466719193641900dd7f26be09d5c1a054cbbce3, Label: extcc-horus-ts-1

# ########################## #
#  Launch Chaincode Service  #
# ########################## #
#
# ibm | oracle
#

export NS=blockchain
export org=oracle
export peer="peer1"
export cc_name=extcc-horus-ts-1
export cc_id=extcc-horus-ts-1:d2f9aba94f859b5431e69c5d9466719193641900dd7f26be09d5c1a054cbbce3
export cc_image=papanadappt/extcc-horus-ts-1

echo "Launching chaincode container \"${cc_image}\""

cat network/azure/orgs/${org}/cc/${org}-cc-template.yaml \
| sed 's,{{CHAINCODE_NAME}},'${cc_name}',g' \
| sed 's,{{CHAINCODE_ID}},'${cc_id}',g' \
| sed 's,{{CHAINCODE_IMAGE}},'${cc_image}',g' \
| sed 's,{{PEER_NAME}},'${peer}',g' \
| exec kubectl -n $NS apply -f -






# ################################### #
# lifecycle chaincode ApproveForMyOrg #
# ################################### #


peer lifecycle chaincode approveformyorg \
        -o orderer0-service:7050 \
        --tls --cafile /etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem \
        --channelID mainchannel \
        --name extcc-horus-ts-1 \
        --version 1.0 \
        --package-id extcc-horus-ts-1:0e59eef6001c1999cf417efefc88f714f9beafabbab388b4f33793a41602beb1 \
        --sequence 1

peer lifecycle chaincode checkcommitreadiness \
    --channelID mainchannel \
    --name extcc-horus-ts-1 \
    --version 1.0 \
    --sequence 1 \
    -o orderer0-service:7050 \
    --tls --cafile /etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem \
    --output json







peer lifecycle chaincode commit \
  -o orderer0-service:7050 \
  --channelID mainchannel \
  --name extcc-horus-ts-1\
  --version 1.0 --sequence 1 \
  --tls true --cafile /etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem 



#
kubectl -n $NS get pods
kubectl -n $NS describe pods $(kubectl -n $NS get pods -o=name | grep ibmpeer0-ccaas-extcc-horus-ts | sed "s/^.\{4\}//") 
kubectl -n $NS logs -f $(kubectl -n $NS get pods -o=name | grep ibmpeer0-ccaas-extcc-horus-ts | sed "s/^.\{4\}//") 



kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode invoke -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["InitLedger"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'


kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["ReadUser","email4@example.com"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'


peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '{"Args":["ReadUser","horusadmin@aegiscybersystems.com"]}'
peer chaincode invoke -C mainchannel -n extcc-horus-ts-0 -c '{"Args":["InitLedger"]}' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem






peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '{"Args":["GetAllAssets"]}' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem

peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '{"Args":["GetAllAssets"]}' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem



# Query :: READ

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["ReadUser","horusadmin@aegiscybersystems.com"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

# kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

# kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n extcc-horus-ts-1 -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'



curl http://20.246.186.81:3010/api/v1/hostname | jq