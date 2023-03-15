

export NS=blockchain
export PATH_TO_RESOURCE=$PWD/network/azure
# Cloud Settings


function createNS(){
    kubectl create ns $NS
}

function deleteNS(){
    kubectl delete ns $NS
}




function applyPVC(){
    kubectl -n $NS apply -f ${PATH_TO_RESOURCE}/storage/pvc.yaml

    sleep 5

    kubectl -n $NS get pvc

    sleep 2

    kubectl get sc,pv
}

function deletePVC(){
    kubectl -n $NS delete -f ${PATH_TO_RESOURCE}/storage/pvc.yaml

    sleep 5

    kubectl -n $NS get pvc

    sleep 2

    kubectl get sc,pv
}


function applyStorageTestPods(){

    kubectl -n $NS apply -f $PATH_TO_RESOURCE/storage/tests

    sleep 60

}

function destroyStorageTestPods(){

    kubectl -n $NS delete -f $PATH_TO_RESOURCE/storage/tests

}

function copyFilesToRemotePod(){

    # Create Remote Directory

    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- mkdir -p /host/files/scripts
    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- mkdir -p /host/files/chaincode


    # Copy files from local to remote cluster
    kubectl -n $NS cp ./scripts $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/
    kubectl -n $NS cp ./network/aws/configtx.yaml $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files
    kubectl -n $NS cp ./network/aws/config.yaml $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files

    kubectl -n $NS cp ./network/aws/config $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files

    # kubectl -n $NS cp ./chaincode/resources $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/chaincode
    # kubectl -n $NS cp ./chaincode/resource_types $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/chaincode
    kubectl -n $NS cp ./chaincode $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files

    #kubectl -n $NS cp ./chaincode/application-go $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/chaincode
    # kubectl -n $NS cp ./chaincode/application-javascript $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/chaincode

    # CHAINCODE >> asset-transfer-basic
    # kubectl -n $NS cp ../asset-transfer-basic $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/chaincode/application-go

    # Copy script files
    # kubectl -n $NS cp ./scripts/pkgk8scc.sh $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files/scripts
    kubectl -n $NS cp ./fabric-samples/bin $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/host/files

    sleep 20
}

function removeFilesFromRemotePod(){

    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- rm -R /host/files
    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- rm -Rf /host/state

}

function applyCAs(){
    kubectl -n $NS apply -f network/aws/cas

    sleep 20
}

function destroyCAs(){
    kubectl -n $NS delete -f network/aws/cas
}

function buildArtifacts(){
 
    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- mkdir -p /host/files/orderer
    kubectl -n $NS exec $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- mkdir -p /host/files/channels

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- bash -c 'cd /host/files && bin/configtxgen -profile OrdererGenesis -channelID syschannel -outputBlock ./orderer/genesis.block'
    
    sleep 1

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- bash -c 'cd /host/files && bin/configtxgen -profile MainChannel -outputCreateChannelTx ./channels/mainchannel.tx -channelID mainchannel'
    
    sleep 1

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- bash -c 'cd /host/files && bin/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/ibm-anchors.tx -channelID mainchannel -asOrg ibm'
    
    sleep 1

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- bash -c 'cd /host/files && bin/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/oracle-anchors.tx -channelID mainchannel -asOrg oracle'
}

function applyOrders(){
    kubectl -n $NS apply -f network/aws/orderers

    sleep 30
}

function destroyOrders(){
    kubectl -n $NS delete -f network/aws/orderers
}

function applyCouchDB(){
    kubectl -n $NS apply -f network/aws/orgs/ibm/couchdb 
    kubectl -n $NS apply -f network/aws/orgs/oracle/couchdb

    sleep 30
}

function destroyCouchDB(){
    kubectl -n $NS delete -f network/aws/orgs/ibm/couchdb 
    kubectl -n $NS delete -f network/aws/orgs/oracle/couchdb

    sleep 5
}

function applyPeers(){
    kubectl -n $NS apply -f network/aws/orgs/ibm/
    kubectl -n $NS apply -f network/aws/orgs/oracle/

    sleep 30
}

function destroyPeers(){
    kubectl -n $NS delete -f network/aws/orgs/ibm/
    kubectl -n $NS delete -f network/aws/orgs/oracle/
}

function applyCLIs(){
    kubectl -n $NS apply -f network/aws/orgs/ibm/cli 
    kubectl -n $NS apply -f network/aws/orgs/oracle/cli

    sleep 30
}

function destroyCLIs(){
    kubectl -n $NS delete -f network/aws/orgs/ibm/cli 
    kubectl -n $NS delete -f network/aws/orgs/oracle/cli
}


function createChannels(){

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel create -c mainchannel -f ./channels/mainchannel.tx -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem'

    sleep 10

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'cp mainchannel.block ./channels/'

    sleep 10

    # Join Channels
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel join -b channels/mainchannel.block'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel join -b channels/mainchannel.block'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel join -b channels/mainchannel.block'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel join -b channels/mainchannel.block'

    sleep 10

    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel update -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem -c mainchannel -f channels/ibm-anchors.tx'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel update -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/orderers-ca-service-7054.pem -c mainchannel -f channels/oracle-anchors.tx'

    sleep 10

    # Check Join Channel List
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel list'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer0-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel list'

    sleep 2

    # Channel getinfo
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-ibm-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel getinfo -c mainchannel'
    kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep cli-peer1-oracle-deployment | sed "s/^.\{4\}//") -- bash -c 'peer channel getinfo -c mainchannel'
}

function dummyFunction(){
    echo "Setup Network"
}

function start(){

    echo "Setup Network"

    # createNS
    applyPVC
    applyStorageTestPods

    # copyFilesToRemotePod
    # applyCAs

    # *** buildArtifacts *** 

    # applyOrders
    # kubectl -n $NS apply -f network/aws/cc_builders/builders-config.yaml
    # applyCouchDB
    # applyPeers
    # applyCLIs
    # createChannels

}

function destroy(){

    echo "Destroy Network"

    # destroyCLIs
    # destroyPeers
    # destroyCouchDB
    # kubectl -n $NS delete -f network/aws/cc_builders/builders-config.yaml
    # destroyOrders
    # destroyCAs

    # sleep 60

    # removeFilesFromRemotePod

    destroyStorageTestPods
    deletePVC

    # deleteNS
    
}

# kubectl -n $NS exec -it $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//") -- /bin/bash

start
# destroy
