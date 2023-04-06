const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const bcrypt = require('bcrypt');

// Constant
// const { DEBUG, ADMIN_USER_NAME, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ROLE } = require('../../controllers/utils/env');

// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[users:update]', message, param)
}


module.exports = {

    updateUser: async function(req, res) {
        try {

            consolelog("Update User")

            const now = new Date()
            const createdBy = "appuser_org1";
            const representativeEmail = req.params.REPRESENTATIVE_EMAIL.toLowerCase();
            const representativeOrganisation = "org1"

            let { lastLogin, representativeName, representativePassword, representativeRole, isActive, params } = req.body;

            let payload = {
                lastLogin: '', 
                representativeName: '', 
                representativePassword: '', 
                representativeRole: '', 
                isActive: '', 
                params: ''
            }

            let hasToUpdate=false

            // Update the lastLogin
            if(lastLogin){
                hasToUpdate=true
                payload.lastLogin = now.toISOString();
            }

            // Update the Full Name of the User
            if(representativeName){
                hasToUpdate=true
                payload.representativeName = representativeName
            }

            // Change the role of the user
            if(representativePassword){
                hasToUpdate=true
                const hashPassword = bcrypt.hashSync(representativePassword, 10);
                payload.representativePassword = hashPassword
            }

            // Change the role of the user
            if(representativeRole){
                hasToUpdate=true
                payload.representativeRole = representativeRole
            }

            // Suspend the Account
            if(typeof isActive === 'boolean'){
                hasToUpdate=true
                payload.isActive = isActive == true ? 1:0
            }

            if(params){
                hasToUpdate=true
                payload.params = params;
            }
            
            if(hasToUpdate){

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

                // representativeEmail, lastLogin, representativeName, representativePassword, representativeRole, isActive, params
                await contract.submitTransaction('UpdateUser', representativeEmail, payload.lastLogin, payload.representativeName, payload.representativePassword, payload.representativeRole, payload.isActive, payload.params);

                await gateway.disconnect();

                return res.status(200).json({
                    status: true,
                    data: req.body,
                    errorMessage: null
                })

            }else{
                return res.status(400).json({
                    status: true,
                    data: null,
                    errorMessage: common.constructErrorMessage(`No update mentioned.`)
                })
            }
            

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