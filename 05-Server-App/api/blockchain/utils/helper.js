'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const os = require('os');
const util = require('util');
//const con = require('../../../scripts')



// Env Variable
// const {DEBUG, CCP_PATH, WALLET_PATH, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ADMIN_USER_NAME} = require('../../controllers/utils/env')

function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[utils:helper]', message, param)
}


const getCCP = async(org) => {
    let ccpPath = path.join(process.env.CCP_PATH, `${org.toLowerCase()}_ccp.json`);

    /* if (org == "Org1") {
        ccpPath = path.join(
            CCP_PATH,
            'connection-org1.json');

    } else if (org == "Org2") {
        ccpPath = path.join(
            CCP_PATH,
            'connection-org2.json');
    } else
        return null */

    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);
    return ccp
}

const getCaUrl = async(org, ccp) => {
    /* let caURL;
    if (org == "Org1") {
        caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;

    } else if (org == "Org2") {
        caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
    } else
        return null
    return caURL */

    return ccp.certificateAuthorities[`ca.${org.toLowerCase()}.example.com`].url;

}

const getOrgMspId = async(org) => {
    return `${org}MSP`
}

const getWalletPath = async(org) => {
    // return path.join(process.env.WALLET_PATH, `appuser_${org.toLowerCase()}`)
    return process.env.WALLET_PATH
}


const getAffiliation = async(org) => {
    return org == "Org1" ? 'org1.department1' : 'org2.department1'
    //return `${org.toLowerCase()}.department1`
}

const getRegisteredUser = async(username, userOrg, isJson) => {
    let ccp = await getCCP(userOrg)

    const caURL = await getCaUrl(userOrg, ccp)
    const ca = new FabricCAServices(caURL);

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        var response = {
            success: true,
            message: username + ' enrolled Successfully',
        };
        return response
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get(ADMIN_USER_NAME);
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get(ADMIN_USER_NAME);
        console.log("Admin Enrolled Successfully")
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, ADMIN_USER_NAME);
    let secret;
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client' }, adminUser);
        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);

    } catch (error) {
        return error.message
    }

    const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
    // const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret, attr_reqs: [{ name: 'role', optional: false }] });

    let x509Identity;
    if (userOrg == "Org1") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
    } else if (userOrg == "Org2") {
        x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509',
        };
    }

    await wallet.put(username, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${username} and imported it into the wallet`);

    var response = {
        success: true,
        message: username + ' enrolled Successfully',
    };
    return response
}

const isUserRegistered = async(username, userOrg) => {
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} exists in the wallet`);
        return true
    }
    return false
}


const getCaInfo = async(org, ccp) => {
    /* let caInfo
    if (org == "Org1") {
        caInfo = ccp.certificateAuthorities['ca.org1.example.com'];

    } else if (org == "Org2") {
        caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
    } else
        return null */
    return ccp.certificateAuthorities[`ca.${org.toLowerCase()}.example.com`];

}

const enrollAdmin = async(org, ccp) => {

    console.log('calling enroll Admin method')

    try {

        const caInfo = await getCaInfo(org, ccp) //ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(ADMIN_USER_NAME);
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: ADMIN_USER_NAME, enrollmentSecret: 'adminpw' });
        let x509Identity;
        if (org == "Org1") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
        } else if (org == "Org2") {
            x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509',
            };
        }

        await wallet.put(ADMIN_USER_NAME, x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

const registerAndGerSecret = async(username, userOrg) => {
    //console.log("======>>> Register And Gen Secret <<<========")
    let ccp = await getCCP(userOrg)
    
    const caURL = await getCaUrl(userOrg, ccp)
    const ca = new FabricCAServices(caURL);

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        var response = {
            success: true,
            message: username + ' enrolled Successfully',
        };
        return response
    }
    
    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }
    
    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    
    let secret;
    let enrollment;
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client' }, adminUser);
        //secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: username, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);

        enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });

    } catch (error) {
        return error.message
    }
    
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: await getOrgMspId(userOrg),
        type: 'X.509',
    };
    
    await wallet.put(username, x509Identity);

    var response = {
        success: true,
        message: username + ' enrolled Successfully',
        secret: secret,
        x509Identity: x509Identity
    };
    return response

}

//exports.getRegisteredUser = getRegisteredUser

const getDetailByKey = async(_identity, key, userOrg, isJson) => {

    //consolelog(_identity, key)

    let ccp = await getCCP(userOrg)

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    //consolelog(`Wallet path: ${walletPath}`);

    const identity = await wallet.get(_identity);
    if (!identity) {
        consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
        return;
    }

    const connectOptions = {
        wallet,
        identity: identity,
        discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
    }

    //consolelog(connectOptions)

    const gateway = new Gateway();
    await gateway.connect(ccp, connectOptions);

    const network = await gateway.getNetwork(CHANNEL_NAME);

    const contract = network.getContract(CHAINCODE_NAME);

    let results = await contract.evaluateTransaction('readUsers', key)

    await gateway.disconnect();
    //consolelog("Gateway Disconnected!!")

    return JSON.parse(results.toString());
}

module.exports = {
    getCCP: getCCP,
    getOrgMspId: getOrgMspId,
    getWalletPath: getWalletPath,
    getRegisteredUser: getRegisteredUser,
    isUserRegistered: isUserRegistered,
    registerAndGerSecret: registerAndGerSecret,
    getDetailByKey: getDetailByKey
}