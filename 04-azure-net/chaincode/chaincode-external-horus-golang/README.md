
export CC_NAME=horus-golang-cc
# Deploy 
./network chaincode deploy $CC_NAME /Users/papandas/workspace/adappt/azure-aks-kubernetes/04-azure-net/chaincode/chaincode-external-horus-golang

# Invoke
./network chaincode invoke $CC_NAME '{"Args":["InitLedger"]}' 


# Query
./network chaincode query $CC_NAME '{"Args":["GetAllAssets"]}' 

# Invoke : Add New
./network chaincode invoke $CC_NAME '{"Args":["CreateAsset","1","blue","35","tom","1000"]}' 
./network chaincode invoke $CC_NAME '{"Args":["UpdateAsset","1","red","45","dick","100"]}' 

# Query : Read Asset
./network chaincode query $CC_NAME '{"Args":["ReadAsset","1"]}' | jq 
