#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function app_one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function app_json_ccp {
  local ORG=$1
  local PP=$(one_line_pem $2)
  local CP=$(one_line_pem $3)
  local NS=$4
  sed -e "s/\${ORG}/$ORG/" \
      -e "s#\${PEERPEM}#$PP#" \
      -e "s#\${CAPEM}#$CP#" \
      -e "s#\${NS}#$NS#" \
      scripts/ccp-template.json
}

function app_id {
  local MSP=$1
  local CERT=$(one_line_pem $2)
  local PK=$(one_line_pem $3)

  sed -e "s#\${CERTIFICATE}#$CERT#" \
      -e "s#\${PRIVATE_KEY}#$PK#" \
      -e "s#\${MSPID}#$MSP#" \
      scripts/appuser.id.template
}

function construct_application_configmap() {
  local ns=$NS
  local org1msp=ibm
  local org2msp=oracle
  local TEMP_DIR=./build
  push_fn "Constructing application connection profiles"

  ENROLLMENT_DIR=${TEMP_DIR}/crypto-config/peerOrganizations
  CHANNEL_MSP_DIR=${TEMP_DIR}/crypto-config

  mkdir -p ${TEMP_DIR}/application/wallet
  mkdir -p ${TEMP_DIR}/application/gateways

  local peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org1msp/msp/tlscacerts/ibm-ca-service-7054.pem
  local ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org1msp/msp/cacerts/ca.ibm-cert.pem

  echo "$(app_json_ccp $org1msp $peer_pem $ca_pem $ns)" > build/application/gateways/org1_ccp.json

  peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org2msp/msp/tlscacerts/oracle-ca-service-7054.pem
  ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org2msp/msp/cacerts/ca.oracle-cert.pem

  echo "$(app_json_ccp $org2msp $peer_pem $ca_pem $ns)" > build/application/gateways/org2_ccp.json

  pop_fn

  push_fn "Getting Application Identities"

  local cert=$ENROLLMENT_DIR/$org1msp/users/User1@ibm/msp/signcerts/User1@ibm-cert.pem
  local pk=$ENROLLMENT_DIR/$org1msp/users/User1@ibm/msp/keystore/pvt-cert.pem

  echo "$(app_id $org1msp $cert $pk)" > build/application/wallet/appuser_org1.id

  local cert=$ENROLLMENT_DIR/$org2msp/users/User1@oracle/msp/signcerts/User1@oracle-cert.pem
  local pk=$ENROLLMENT_DIR/$org2msp/users/User1@oracle/msp/keystore/pvt-cert.pem

  echo "$(app_id $org2msp $cert $pk)" > build/application/wallet/appuser_org2.id

  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-tls-v1-map\" with TLS certificates for the application"
  kubectl -n $NS delete configmap app-fabric-tls-v1-map || true
  kubectl -n $NS create configmap app-fabric-tls-v1-map --from-file=$CHANNEL_MSP_DIR/peerOrganizations/$org1msp/msp/tlscacerts
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-ids-v1-map\" with identities for the application"
  kubectl -n $NS delete configmap app-fabric-ids-v1-map || true
  kubectl -n $NS create configmap app-fabric-ids-v1-map --from-file=./build/application/wallet
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-ccp-v1-map\" with ConnectionProfile for the application"
  kubectl -n $NS delete configmap app-fabric-ccp-v1-map || true
  kubectl -n $NS create configmap app-fabric-ccp-v1-map --from-file=./build/application/gateways
  pop_fn

  push_fn "Creating ConfigMap \"app-fabric-org1-v1-map\" with Organization 1 information for the application"

cat <<EOF > build/app-fabric-org1-v1-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-fabric-org1-v1-map
data:
  fabric_channel: mainchannel
  fabric_contract: extcc-horus-ts-1
  fabric_wallet_dir: /fabric/application/wallet
  fabric_gateway_hostport: org1-peer-gateway-svc:7051
  fabric_gateway_sslHostOverride: org1-peer-gateway-svc
  fabric_user: appuser_org1
  fabric_gateway_tlsCertPath: /fabric/tlscacerts/tlsca-signcert.pem
EOF

  kubectl -n $NS delete configmap app-fabric-org1-v1-map || true
  kubectl -n $NS apply -f build/app-fabric-org1-v1-map.yaml

  # todo: could add the second org here

  pop_fn
}


function application_connection() {

 # construct_application_configmap

 kubectl -n $NS cp ./build/application $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):/mnt/azure/files


 # kubectl -n $NS apply -f network/azure/orgs/application-deployment.yaml
 # kubectl -n $NS rollout status deploy/application-deployment

}