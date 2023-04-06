const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');


// Constant
// const { DEBUG, AS_LOCALHOST, CHAINCODE_NAME, CHANNEL_NAME, ADMIN_USER_NAME, ROLE } = require('../../controllers/utils/env');

// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[users:delete]', message, param)
}


module.exports = {
 

    deleteOneUsers: async function(req, res) {
        try {

            consolelog("Delete : User below");

            const createdBy = "appuser_org1";
            const representativeEmail = req.params.REPRESENTATIVE_EMAIL.toLowerCase();
            const representativeOrganisation = "org1"
            
            
            const ccp = await helper.getCCP(representativeOrganisation);

            const walletPath = await helper.getWalletPath(representativeOrganisation);
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            

            let identity = await wallet.get(createdBy);
            if (!identity) {
                consolelog(`An identity for the user ${createdBy} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`An identity for the user ${createdBy} does not exist in the wallet.`)
                });
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

            await contract.submitTransaction('DeleteUser', representativeEmail);
            await gateway.disconnect();

            return res.status(200).json({
                status: true,
                data: {
                    representativeEmail
                },
                errorMessage: null
            })

        } catch (error) {
            //console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${common.catchBlockchianErrorMessage(error)}`)
            })
        }
    },

}