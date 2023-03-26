#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This magical awk script led to 30 hours of debugging a "TLS handshake error"
# moral: do not edit / alter the number of '\' in the following transform:
function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
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

function construct_rest_sample_configmap() {
  local ns=$NS
  local org1msp=ibm
  local org2msp=oracle
  local TEMP_DIR=./build
  push_fn "Constructing fabric-rest-sample connection profiles"

  ENROLLMENT_DIR=${TEMP_DIR}/crypto-config/peerOrganizations
  CHANNEL_MSP_DIR=${TEMP_DIR}/crypto-config
  CONFIG_DIR=${TEMP_DIR}/fabric-rest-sample-config 

  mkdir -p $CONFIG_DIR

  # local peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/org1/msp/tlscacerts/tlsca-signcert.pem 
  # local ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/org1/msp/cacerts/ca-signcert.pem
  # echo "$(json_ccp 1 $peer_pem $ca_pem $ORG1_NS)" > build/fabric-rest-sample-config/HLF_CONNECTION_PROFILE_ORG1

  local peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org1msp/msp/tlscacerts/ibm-ca-service-7054.pem
  local ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org1msp/msp/cacerts/ca.ibm-cert.pem
  echo "$(json_ccp $org1msp $peer_pem $ca_pem $ns)" > $CONFIG_DIR/HLF_CONNECTION_PROFILE_ORG1

  # peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/org2/msp/tlscacerts/tlsca-signcert.pem
  # ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/org2/msp/cacerts/ca-signcert.pem
  # echo "$(json_ccp 2 $peer_pem $ca_pem $ORG2_NS)" > build/fabric-rest-sample-config/HLF_CONNECTION_PROFILE_ORG2

  peer_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org2msp/msp/tlscacerts/oracle-ca-service-7054.pem
  ca_pem=$CHANNEL_MSP_DIR/peerOrganizations/$org2msp/msp/cacerts/ca.oracle-cert.pem
  echo "$(json_ccp $org2msp $peer_pem $ca_pem $ns)" > $CONFIG_DIR/HLF_CONNECTION_PROFILE_ORG2

  # cp $ENROLLMENT_DIR/org1/users/org1admin/msp/signcerts/cert.pem $CONFIG_DIR/HLF_CERTIFICATE_ORG1
  # cp $ENROLLMENT_DIR/org2/users/org2admin/msp/signcerts/cert.pem $CONFIG_DIR/HLF_CERTIFICATE_ORG2

  # cp $ENROLLMENT_DIR/org1/users/org1admin/msp/keystore/key.pem $CONFIG_DIR/HLF_PRIVATE_KEY_ORG1
  # cp $ENROLLMENT_DIR/org2/users/org2admin/msp/keystore/key.pem $CONFIG_DIR/HLF_PRIVATE_KEY_ORG2

  cp $ENROLLMENT_DIR/ibm/users/User1@ibm/msp/signcerts/User1@ibm-cert.pem $CONFIG_DIR/HLF_CERTIFICATE_ORG1
  cp $ENROLLMENT_DIR/oracle/users/User1@oracle/msp/signcerts/User1@oracle-cert.pem $CONFIG_DIR/HLF_CERTIFICATE_ORG2

  cp $ENROLLMENT_DIR/ibm/users/User1@ibm/msp/keystore/pvt-cert.pem $CONFIG_DIR/HLF_PRIVATE_KEY_ORG1
  cp $ENROLLMENT_DIR/oracle/users/User1@oracle/msp/keystore/pvt-cert.pem $CONFIG_DIR/HLF_PRIVATE_KEY_ORG2

  kubectl -n $ns delete configmap fabric-rest-sample-config || true
  kubectl -n $ns create configmap fabric-rest-sample-config --from-file=$CONFIG_DIR

  pop_fn
}

function rollout_rest_sample() {
  local ns=$ORG1_NS
  push_fn "Starting fabric-rest-sample"

  kubectl -n $ns apply -f network/azure/orgs/fabric-rest-sample.yaml
  kubectl -n $ns rollout status deploy/fabric-rest-sample

  pop_fn
}

function launch_rest_sample() {
  local ns=$NS

  # rm -rf build
  # mkdir -p build/crypto-config

  # kubectl -n $NS cp $(kubectl -n $NS get pods -o=name | grep example1 | sed "s/^.\{4\}//"):$MOUNT_PATH/files/crypto-config ./build/crypto-config

  # construct_rest_sample_configmap

  apply_template network/azure/orgs/fabric-rest-sample.yaml $ns

  kubectl -n $ns rollout status deploy/fabric-rest-sample

  log ""
  log "The fabric-rest-sample has started."
  log "See https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/rest-api-typescript for additional usage details."
  log "To access the endpoint:"
  log ""
  log "export SAMPLE_APIKEY=97834158-3224-4CE7-95F9-A148C886653E"
  log 'curl -s --header "X-Api-Key: ${SAMPLE_APIKEY}" http://fabric-rest-sample.'${DOMAIN}'/api/assets'
  log ""
}