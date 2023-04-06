const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const os = require('os');
const moment = require('moment');

// Constant
// const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ADMIN_USER_NAME, CUSTOMER_ADMINISTRATORS_USER_NAME, ROLE} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');


function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[documents:query]', message, param)
}


module.exports = {

    listAllDocuments: async function(req, res) {
        try {

            consolelog("Query All Documents")

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
            
            //let results = await contract.evaluateTransaction('queryStringByCreator', SUPER_ADMIN_USER)

            let queryString = {}
            queryString.selector = {};
            queryString.selector.docType = 'doc_document';
            queryString.selector.createdBy = representativeEmail;

            
            const results = await contract.evaluateTransaction('QueryAssets', JSON.stringify(queryString))
            
            await gateway.disconnect();

            try{

                const resultsJSON = JSON.parse(results.toString());

                let reply = []

                for (let each in resultsJSON) {
                    (function(idx, arr) {

                        reply.push({
                            docId: arr[idx].Record.docId,
                            dataHash: arr[idx].Record.dataHash,
                            //sharedWithList = ''
                            createdAt: arr[idx].Record.createdAt,
                            createdBy: arr[idx].Record.createdBy,
                            modifiedAt: arr[idx].Record.modifiedAt,
                            modifiedBy: arr[idx].Record.modifiedBy,
                            version: arr[idx].Record.version,
                            metadata: arr[idx].Record.metadata,
                            isActive: parseInt(arr[idx].Record.isActive) === 1 ? true:false,
                        })

                    })(each, resultsJSON)
                }
            
                return res.status(200).json({
                    status: true,
                    data: {
                        documents:reply
                    },
                    errorMessage: null
                })

            }catch(error){
                return res.status(400).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. ${error.message}.`)
                })
            }

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },

    


    getDocumentsByDocId: async function(req, res){

        try {
            

            consolelog("Query one document");

            const createdBy = "appuser_org1"
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

            //consolelog(identity)

            const results = await contract.evaluateTransaction('ReadDocument', docId)
            await gateway.disconnect();

            let resultJSON = JSON.parse(results.toString())

            return res.status(200).json({
                status: true,
                data: {
                    document:resultJSON
                },
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


    
    
    getHistoryRecords: async function(req, res){

        try {
            consolelog("Query document history");

            const createdBy = res.locals.userDetails._representativeEmail
            const docId = req.params.DOCUMENT_ID.toLowerCase();
            const representativeOrganisation = res.locals.userDetails._representativeOrganisation

        
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
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            //consolelog(identity)

            const results = await contract.evaluateTransaction('getHistory', docId)

            await gateway.disconnect();

            const resultsJSON = JSON.parse(results.toString())

            try{

                let reply = []

                if(resultsJSON.length){
                    for (let each in resultsJSON) {
                        (function(idx, arr) {

                            //console.log(arr[idx])

                            const seconds = arr[idx].Timestamp.seconds
                            const nanos = String(arr[idx].Timestamp.nanos).substring(0,3)
                            const timestamp = seconds + nanos
                            const dt = new Date(parseInt(timestamp))
    
                            reply.push({
                                Timestamp: dt.toISOString(),
                                Value: {
                                    docId: arr[idx].Value.docId,
                                    docType: arr[idx].Value.docType,
                                    docStatus: arr[idx].Value.docStatus ? arr[idx].Value.docStatus : '',
                                    title: arr[idx].Value.title ? arr[idx].Value.title:'',
                                    metadata: arr[idx].Value.metadata,
                                    version: arr[idx].Value.version,
                                    dataHash: arr[idx].Value.dataHash,
                                    createdAt: arr[idx].Value.createdAt,
                                    createdBy: arr[idx].Value.createdBy,
                                    modifiedAt: arr[idx].Value.modifiedAt,
                                    modifiedBy: arr[idx].Value.modifiedBy,
                                    isActive: parseInt(arr[idx].Value.isActive) === 1 ? true:false,
                                    sharedWithList: arr[idx].Value.sharedWithList,
                                    txId: arr[idx].Value.txId
                                }
                            })
    
                        })(each, resultsJSON)
                    }                    
                }

                return res.status(200).json({
                    status: true,
                    documents: reply,
                    errorMessage: null
                }) 

            }catch(error){
                return res.status(400).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. ${error.message}.`)
                })
            } 
    
            

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
