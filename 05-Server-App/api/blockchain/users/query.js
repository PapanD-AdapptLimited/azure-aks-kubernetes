const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const os = require('os');
const moment = require('moment');

// Constant
// const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ADMIN_USER_NAME, CUSTOMER_ADMINISTRATORS_USER_NAME, ROLE, WALLET_PATH} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');


function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[users:query]', message, param)
}


module.exports = {


    getOneUser: async function(req, res) {
        try {

            consolelog("Query one user");

            const createdBy = "appuser_org1"
            const representativeEmail = req.params.REPRESENTATIVE_EMAIL.toLowerCase();
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

            //consolelog(identity)

            let results = await contract.evaluateTransaction('ReadUser', representativeEmail)

            await gateway.disconnect();

            let resultJSON = JSON.parse(results.toString())

            // consolelog(resultJSON)

            const user = {
                representativeEmail: resultJSON.representativeEmail,
                representativeName: resultJSON.representativeName,
                representativeRole: resultJSON.representativeRole,
                representativeOrganisation: resultJSON.representativeOrganisation,
                createdAt: resultJSON.createdAt,
                createdBy: resultJSON.createdBy,
                isActive: parseInt(resultJSON.isActive) == 1 ? true:false,
                lastLogin: resultJSON.lastLogin,
            }

            return res.status(200).json({
                status: true,
                data: {user},
                errorMessage: null
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${common.catchBlockchianErrorMessage(error)}`)
            })
        }
    },
    
    getAllUser: async function(req, res) {
        try {

            consolelog("Query one user");

            const createdBy = "appuser_org1"
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

            //consolelog(identity)

            const results = await contract.evaluateTransaction("QueryAssets", "{\"selector\":{\"docType\":\"doc_user\"}}")

            await gateway.disconnect();

            const resultsJSON = JSON.parse(results.toString())

            // consolelog(resultsJSON)

            let reply = []

            if(resultsJSON.length){
                for (let each in resultsJSON) {
                    (function(idx, arr) {
                        reply.push({
                            key: arr[idx].Key,
                            representativeEmail: arr[idx].Record.representativeEmail,
                            representativeName: arr[idx].Record.representativeName,
                            representativeRole: arr[idx].Record.representativeRole,
                            representativeOrganisation: arr[idx].Record.representativeOrganisation,
                            createdAt: arr[idx].Record.createdAt,
                            createdBy: arr[idx].Record.createdBy,
                            isActive: parseInt(arr[idx].Record.isActive) === 1 ? true:false,
                            lastLogin: arr[idx].Record.lastLogin
                        })
                    })(each, resultsJSON)
                }

            }

            return res.status(200).json({
                status: true,
                data: {users:reply},
                errorMessage: null
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${common.catchBlockchianErrorMessage(error)}`)
            })
        }
    },
}