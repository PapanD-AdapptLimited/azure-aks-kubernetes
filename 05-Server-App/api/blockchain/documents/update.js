const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const bcrypt = require('bcrypt');

// Constant
const { DEBUG, ADMIN_USER_NAME, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ROLE } = require('../../controllers/utils/env');

// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (DEBUG) console.log('[documents:update]', message, param)
}


module.exports = {

    updateDocuments: async function(req, res) {
        try {

            consolelog("Update Documents")

            const modifiedAt = new Date()
            const docId = req.params.DOCUMENT_ID.toLowerCase();
            const createdAt = new Date()
            const createdBy = "appuser_org1"
            const representativeOrganisation = "org1"

            let { docStatus, title, isActive, version } = req.body;

            let payload = {
                docId: docId, 
                dataHash: '', 
                metadata: '', 
                version: version ? version:'', 
                modifiedBy: createdBy, 
                modifiedAt: modifiedAt.toISOString(), 
                isActive: isActive.toString() == "true" ? 1:0,
                sharedWithList: '', 
                title: title ? title:'', 
                docStatus: docStatus ? docStatus:'update', 
                documentPath: '', 
                params: '', 
                comments: '', 
                encryptionLevel: ''
            }


            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            

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

            // docId, dataHash, metadata, version, modifiedBy, modifiedAt, isActive, sharedWithList, title, docStatus, documentPath, params, comments, encryptionLevel
            await contract.submitTransaction('UpdateDocument', docId, payload.dataHash, payload.metadata, payload.version, payload.modifiedBy, payload.modifiedAt, payload.isActive, payload.sharedWithList, payload.title, payload.docStatus, payload.documentPath, payload.params, payload.comments, payload.encryptionLevel);

            await gateway.disconnect();

            return res.status(200).json({
                status: true,
                data: payload,
                errorMessage: null
            })
            

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },

}