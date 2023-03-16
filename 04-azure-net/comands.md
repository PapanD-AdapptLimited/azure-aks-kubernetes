cd /host/files
mkdir -p orderer channels
bin/configtxgen -profile OrdererGenesis -channelID syschannel -outputBlock ./orderer/genesis.block
bin/configtxgen -profile MainChannel -outputCreateChannelTx ./channels/mainchannel.tx -channelID mainchannel
bin/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/ibm-anchors.tx -channelID mainchannel -asOrg ibm
bin/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/oracle-anchors.tx -channelID mainchannel -asOrg oracle










##
ibm
oracle

export org=$CORE_PEER_LOCALMSPID
export peer=peer1
export cc_name=chaincode-external
export cc_label=${cc_name}
export cc_archive=/opt/gopath/src/github.com/chaincode-external/${cc_name}.tgz

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

cp ${cc_folder}/connection.json .
cp ${cc_folder}/metadata.json .
cp ${cc_archive} .

sleep 1

peer lifecycle chaincode install ${cc_name}.tgz


















# ################################## #
# lifecycle chaincode queryinstalled #
# ################################## #

peer lifecycle chaincode calculatepackageid /opt/gopath/src/chaincode-external/asset-transfer-basic-external.tgz

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer lifecycle chaincode queryinstalled'







# ########################## #
#  Launch Chaincode Service  #
# ########################## #
#
# ibm | oracle
#

export NS=blockchain
export org=oracle
export peer="peer1"
export cc_name=chaincode-external
export cc_id=chaincode-external:d1161df70da853ef74d704266a50687cb1737ce772c6b622146a53424830ab13
export cc_image=papanadappt/chaincode-external:1.0.0

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
        --name chaincode-external \
        --version 1.0 \
        --package-id chaincode-external:ed83650d876217a4cba8204d444b0baf7c9538c10790a365ad6040869aeb63ac \
        --sequence 1

peer lifecycle chaincode checkcommitreadiness \
    --channelID mainchannel \
    --name chaincode-external \
    --version 1.0 \
    --sequence 1 \
    -o orderer0-service:7050 \
    --tls --cafile /etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem \
    --output json





peer lifecycle chaincode commit \
  -o orderer0-service:7050 \
  --channelID mainchannel \
  --name chaincode-external \
  --version 1.0 --sequence 1 \
  --tls true --cafile /etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem 





  kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode invoke -C mainchannel -n chaincode-external -c '\''{"Args":["InitLedger"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'


  # Query :: GetAllAssets

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

# kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

# kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["GetAllAssets"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'


# ####################### #
#  Invoke :: CreateAsset  #
# ####################### #
#
# id, color string, size int, owner string, appraisedValue int
# {ID: "asset6", Color: "white", Size: 15, Owner: "Michel", AppraisedValue: 800},
kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode invoke -C mainchannel -n chaincode-external -c '\''{"Args":["CreateAsset", "asset7", "white", "15", "Papan Das", "100"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'


# Query :: ReadAsset

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["ReadAsset", "asset1"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer chaincode query -C mainchannel -n chaincode-external -c '\''{"Args":["ReadAsset", "asset2"]}'\'' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'
