const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const bcrypt = require('bcrypt');

// Constant
// const { DEBUG, ADMIN_USER_NAME, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, DOC_STATUS } = require('../../controllers/utils/env');

// Helper
const helper = require('../utils/helper');

// common function
const common = require('../../controllers/utils/env')



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[documents:delete]', message, param)
}


module.exports = {

    deleteDocuments: async function(req, res) {
        try {

            
            const createdBy = "appuser_org1";
            const docId = req.params.DOCUMENT_ID.toLowerCase();
            const representativeOrganisation = "org1"

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

            await contract.submitTransaction('DeleteDocument', docId);
            await gateway.disconnect();
        
            return res.status(200).json({
                status: true,
                data: {docId},
                errorMessage: null
            });
            
            

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