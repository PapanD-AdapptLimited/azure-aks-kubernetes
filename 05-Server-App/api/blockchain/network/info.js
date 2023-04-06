const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
// const { BlockDecoder } = require('fabric-common');
const fabricprotos = require('fabric-protos');
const Long = require('long');
// const { StringDecoder } = require('string_decoder');


// Constant
// const { DEBUG, AS_LOCALHOST, CHAINCODE_NAME, CHANNEL_NAME } = require('../../controllers/utils/env');

// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[network:info]', message, param)
}


module.exports = {

    getChainInfo: async function(req, res) {
        try {

            consolelog("Get-Chain-Info");

            let _identity = 'appuser_org1';
            let organization = req.params.ORG;

            const ccp = await helper.getCCP(organization)
            console.log(ccp)

            const walletPath = await helper.getWalletPath(organization)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(wallet)

            let identity = await wallet.get(_identity);
            if (!identity) {
                consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: '',
                    errorMessage: common.constructErrorMessage(`An identity for the user ${_identity} does not exist in the wallet.`)
                })
            }
            consolelog("Idetity checked")

            const connectOptions = {
                wallet,
                identity: _identity,
                discovery: { enabled: true, asLocalhost: process.env.AS_LOCALHOST }
            }
            
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            
            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            
            const contract = network.getContract('qscc');
            consolelog("Contract received.")

            /**
            GetChainInfo       string = "GetChainInfo"
            GetBlockByNumber   string = "GetBlockByNumber"
            GetBlockByHash     string = "GetBlockByHash"
            GetTransactionByID string = "GetTransactionByID"
            GetBlockByTxID     string = "GetBlockByTxID" 

            */

            let results = await contract.evaluateTransaction('GetChainInfo', process.env.CHANNEL_NAME);
            //let results = await contract.evaluateTransaction('getPeersStatus', CHANNEL_NAME);

            await gateway.disconnect();

            consolelog("GateWay Disconnected!!!!!");
            const blockProto = fabricprotos.common.BlockchainInfo.decode(results)
            let long = new Long(blockProto.height.low, blockProto.height.high, blockProto.height.unsigned)
            
            return res.status(200).json({
                status: true,
                chaininfo: {
                    height: long.toString(),
                    currentBlockHash: blockProto.currentBlockHash.toString('hex'),
                    previousBlockHash: blockProto.previousBlockHash.toString('hex')
                },
                errorMessage: null
            })


            //consolelog(results.toString())

        } catch (error) {
            console.error(error.message)

            return res.status(400).json({
                status: true,
                chaininfo: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`,)
            })

        }
    },
    
}