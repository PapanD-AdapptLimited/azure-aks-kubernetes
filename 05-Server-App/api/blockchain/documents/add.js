const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');


// Constant
const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, JWT_CONF, ADMIN_USER_NAME} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// common function
const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[documents:add]', message, param)
}


module.exports = {

    addDocuments: async function(req, res) {
        try {

            consolelog("=================");
            consolelog("Create New Documents");
            consolelog("=================");

            /**docId, representativeEmail, dataHash, version, metadata, createdAt*/
            
            const { representativeEmail, dataHash, title, metadata, documentPath } = req.body;

            const docId = uuidv4();
            const createdAt = new Date()
            const createdBy = "appuser_org1"
            const representativeOrganisation = "org1"
            const version = "0";

            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            //

            let identity = await wallet.get(createdBy);
            if (!identity) {
                consolelog(`An identity for the user ${createdBy} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`An identity for the user ${createdBy} does not exist in the wallet.`)
                })
            }
           

            const connectOptions = {
                wallet,
                identity: createdBy,
                discovery: { enabled: true, asLocalhost: process.env.AS_LOCALHOST }
            }
            

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            

            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            const contract = network.getContract(process.env.CHAINCODE_NAME);
            
            // "doc1234","email4@example.com","dataHash","version","title","metadata","createdAt","documentPath","comments","encryptionLevel"
            await contract.submitTransaction('CreateDocument', docId, representativeEmail, dataHash, version, title, metadata, createdAt.toISOString(), documentPath, "default-comments", "default-encryption-level");

            await gateway.disconnect();
            //consolelog("Gateway Disconnected!")

            return res.status(200).json({
                status: true,
                data: {docId, representativeEmail, dataHash, title, metadata, documentPath},
                errorMessage: null
            })

        } catch (error) {
            console.error(error.message)

            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}`)
            })
        }
    },
}



