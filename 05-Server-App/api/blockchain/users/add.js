const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const bcrypt = require('bcrypt');
const path = require('path');
const os = require('os');
const jwt = require('jsonwebtoken');


// Constant
// const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, JWT_CONF, ADMIN_USER_NAME, ROLE} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');


function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[users:add]', message, param)
}


module.exports = {
    addUsers: async function(req, res) {
        try {

            consolelog("=================");
            consolelog("Create New User");
            consolelog("=================");
            consolelog(req.body);


            const now = new Date()
            const createdBy = "appuser_org1"
            let { representativeName, representativeEmail, representativePassword, representativeRole, representativeOrganisation } = req.body;
            
            const hashPassword = bcrypt.hashSync(representativePassword, 10);

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

            //const thisUser = await contract.evaluateTransaction('readUser', representativeEmail.toLowerCase())

            //consolelog("thisUser", thisUser)

            const queryString = JSON.stringify({selector: {representativeEmail: representativeEmail.toLowerCase(),docType: 'doc_user'}}) //;{}
            const queryResults = await contract.evaluateTransaction('QueryAssets', queryString)
            const userExist = JSON.parse(queryResults.toString());

            if(userExist.length){

                await gateway.disconnect();

                return res.status(409).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.Conflict().message} User already exist.`)
                })

            }else{

                // representativeEmail, representativeName, representativePassword, representativeRole, createdBy, createdAt, representativeOrganisation, params
                await contract.submitTransaction('CreateUser', representativeEmail.toLowerCase(), representativeName, hashPassword, representativeRole, createdBy, now.toISOString(), representativeOrganisation, "");

                await gateway.disconnect();

                return res.status(201).json({
                    status: true,
                    data: req.body,
                    errorMessage: null
                })


            }
            
        } catch (error) {
            
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${common.catchBlockchianErrorMessage(error)}`)
            })
        }
    },
}



