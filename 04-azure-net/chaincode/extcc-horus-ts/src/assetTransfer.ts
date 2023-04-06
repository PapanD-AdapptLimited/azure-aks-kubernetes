/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

// ====CHAINCODE EXECUTION (CLI) ==================

// export CC_NAME=extcc-horus-ts-2

// ==== Invoke assets ====
// ./network chaincode invoke $CC_NAME '{"Args":["InitLedger"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["CreateUser","email9@example.com","representative_name","password","role","admin","createdAt","organisation","params"]}'
// "email1@example.com",lastLogin, "representative_name","password","role","isActive","params"
// ./network chaincode invoke $CC_NAME '{"Args":["UpdateUser","email1@example.com","1","","","","0","params2"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["TransferUser","email1@example.com","org2"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["DeleteUser","email1@example.com"]}'
//
//
// ./network chaincode invoke $CC_NAME '{"Args":["CreateDocument","doc1234","email4@example.com","dataHash","version","title","metadata","createdAt","documentPath","comments","encryptionLevel"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["UpdateDocument","doc1234","dataHash1","metadata1","version1","email4@example.com","modifiedAt1","0","sharedWithList1","title1","","/documentPath","{\"helloworld\"}","comments1","encryptionLevel1"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["TransferDocument","doc1234","email1@example.com"]}'
// ./network chaincode invoke $CC_NAME '{"Args":["DeleteDocument","doc1234"]}'
// 


// ==== Query assets ====
// 
// ./network chaincode query $CC_NAME '{"Args":["ReadUser","email4@example.com"]}' | jq
// ./network chaincode query $CC_NAME '{"Args":["QueryAssets","{\"selector\":{\"docType\":\"doc_user\"}}"]}' | jq
// ./network chaincode query $CC_NAME '{"Args":["QueryAssetsWithPagination","{\"selector\":{\"createdBy\":\"admin\"}}","3",""]}' | jq
//
// ./network chaincode query $CC_NAME '{"Args":["ReadDocument","doc1234"]}' | jq
// ./network chaincode query $CC_NAME '{"Args":["QueryAssets","{\"selector\":{\"docType\":\"doc_document\"}}"]}' | jq
// ./network chaincode query $CC_NAME '{"Args":["QueryAssetsWithPagination","{\"selector\":{\"docType\":\"doc_document\"}}","3",""]}' | jq
//
// ./network chaincode query $CC_NAME '{"Args":["GetHistory","doc1234"]}' | jq



import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import moment from 'moment';
import { User } from './user';
import { Document } from './document';
import { PaginatedQueryResult } from './paginatedQueryResult';


@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {
    
    /** 
     * ************************ *
     *      USER'S SECTION      *
     * ************************ *
     */

    
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        console.info('=========== Instantiated Horus External Chaincode Typescript ===========');
        const utcMoment = moment.utc();
        const dateTime = moment().format();
        const users: User[] = [
            {
                docType: "doc_user",
                representativeEmail: "horusadmin@aegiscybersystems.com", 
                representativeName: "Horus Admin",
                representativePassword: "G!3Ensw9f27G",
                representativeRole: "horus_super_admins",
                representativeOrganisation: 'aegiscybersystems.com',
                createdBy: "admin",
                createdAt: dateTime.toString(),
                createdAtUTC: utcMoment.toString(),
                lastLogin: dateTime.toString(),
                lastLoginUTC: utcMoment.toString(),
                isActive: 1,
                params: "",
            }
        ];

        for (const user of users) {
            user.docType = 'doc_user';
            await ctx.stub.putState(user.representativeEmail, Buffer.from(stringify(sortKeysRecursive(user))));
            console.info(`User ${user.representativeEmail} initialized`);
        }
    }

    // CreateUser issues a new user to the world state with given details.
    // representativeEmail, representativeName, representativePassword, representativeRole, createdBy, createdAt, representativeOrganisation, params
    @Transaction()
    public async CreateUser(ctx: Context, representativeEmail: string, representativeName: string, representativePassword: string, representativeRole: string, createdBy: string, createdAt: string, representativeOrganisation: string, params: string): Promise<void> {
        console.info('=========== CreateUser Start ===========');
        const exists = await this.UserExists(ctx, representativeEmail);
        if (exists) {
            throw new Error(`The user ${representativeEmail} already exists`);
        }
        const utcMoment = moment.utc();
        const user:User = {
            docType: "doc_user",
            representativeEmail: representativeEmail,
            representativeName: representativeName,
            representativePassword: representativePassword,
            representativeRole: representativeRole,
            representativeOrganisation: representativeOrganisation,
            createdBy: createdBy,
            createdAt: createdAt,
            createdAtUTC: utcMoment.toString(),
            lastLogin: createdAt,
            lastLoginUTC: utcMoment.toString(),
            isActive: 1,
            params: params,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(representativeEmail, Buffer.from(stringify(sortKeysRecursive(user))));
        console.info('=========== CreateUser End ===========');
    }

    // ReadUser returns the user stored in the world state with given representativeEmail.
    @Transaction(false)
    public async ReadUser(ctx: Context, representativeEmail: string): Promise<string> {
        console.info('=========== ReadUser Start ===========');
        const userJSON = await ctx.stub.getState(representativeEmail); // get the asset from chaincode state
        if (!userJSON || userJSON.length === 0) {
            throw new Error(`The user ${representativeEmail} does not exist`);
        }
        return userJSON.toString();
    }


    // UpdateUser updates an existing user in the world state with provided parameters.
    // representativeEmail, lastLogin, representativeName, representativePassword, representativeRole, isActive, params
    @Transaction()
    public async UpdateUser(ctx: Context, representativeEmail: string, lastLogin: string, representativeName: string, representativePassword: string, representativeRole: string, isActive: string, params: string): Promise<void> {

        console.info('=========== UpdateUser Start ===========');

        const exists = await this.UserExists(ctx, representativeEmail);
        if (!exists) {
            throw new Error(`The user ${representativeEmail} does not exist`);
        }

        const utcMoment = moment.utc();
        const userString = await this.ReadUser(ctx, representativeEmail);
        const user:User = JSON.parse(userString);

        // const userJSON = await ctx.stub.getState(representativeEmail); // get the asset from chaincode state
        // console.log(userJSON)
        let updatedUser:User = user

        if(lastLogin != '' && lastLogin != undefined){
            updatedUser.lastLogin = lastLogin;
            updatedUser.lastLoginUTC = utcMoment.toString();
        }

        // overwriting original user with new/updated user
        if(representativeName != '' && representativeName != undefined){
            updatedUser.representativeName = representativeName;
        }

        if(representativePassword != '' && representativePassword != undefined){
            updatedUser.representativePassword = representativePassword;
        }

        if(representativeRole != '' && representativeRole != undefined){
            updatedUser.representativeRole = representativeRole;
        }

        if(isActive != '' && isActive != undefined){
            updatedUser.isActive = parseInt(isActive);
        }

        if(params != '' && params != undefined){
            updatedUser.params = params;
        }

        console.log(updatedUser)
        
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(representativeEmail, Buffer.from(stringify(sortKeysRecursive(updatedUser))));

    }


    // DeleteUser deletes an given user from the world state.
    @Transaction()
    public async DeleteUser(ctx: Context, representativeEmail: string): Promise<void> {
        console.info('=========== DeleteUser Start ===========');
        const exists = await this.UserExists(ctx, representativeEmail);
        if (!exists) {
            throw new Error(`The user ${representativeEmail} does not exist`);
        }
        return ctx.stub.deleteState(representativeEmail);
    }


    // UserExists returns true when user with given representativeEmail exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async UserExists(ctx: Context, representativeEmail: string): Promise<boolean> {
        console.info('=========== UserExists Start ===========');
        const userJSON = await ctx.stub.getState(representativeEmail);
        return userJSON && userJSON.length > 0;
    }


    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferUser(ctx: Context, representativeEmail: string, newOrganisation: string): Promise<string> {
        console.info('=========== TransferUser Start ===========');
        const userString = await this.ReadUser(ctx, representativeEmail);
        const user = JSON.parse(userString);
        const oldOrganisation = user.representativeOrganisation;
        user.representativeOrganisation = newOrganisation;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(representativeEmail, Buffer.from(stringify(sortKeysRecursive(user))));
        return oldOrganisation;
    }


    // GetAllUsers returns all assets found in the world state.
    // @Transaction(false)
    // @Returns('string')
    // public async GetAllUsers(ctx: Context): Promise<string> {
    //     console.info('=========== GetAllUsers Start ===========');
    //     const allResults = [];
    //     // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    //     const iterator = await ctx.stub.getStateByRange('', '');
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push(record);
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }

    /** 
     * **************************** *
     *      DOCUMENTS'S SECTION     *
     * **************************** *
     */

    
    // CreateDocument issues a new Document to the world state with given details.
    // "docId","representativeEmail","dataHash","version","title","metadata","createdAt","documentPath","comments","encryptionLevel"
    @Transaction()
    public async CreateDocument(ctx: Context, docId: string, representativeEmail: string, dataHash: string, version: string, title: string, metadata: string, createdAt: string, documentPath: string, comments: string, encryptionLevel: string): Promise<void> {
        console.info('=========== CreateDocument Start ===========');
        
        const txId: string = ctx.stub.getTxID();
        const utcMoment: string = moment.utc().toString();

        // Check creator User exist
        const userExist: boolean = await this.UserExists(ctx, representativeEmail);
        if (!userExist) {
            throw new Error(`The user ${representativeEmail} does not exist`);
        }

        // Check Document do not exist
        const documentExists: boolean = await this.DocumentExists(ctx, docId);
        if (documentExists) {
            throw new Error(`The Document ${docId} already exists`);
        }

        
        const document:Document = {
            docType: "doc_document",
            docStatus: 'create',
            docId: docId,
            dataHash: dataHash,
            sharedWithList: '',
            createdAt: createdAt,
            createdAtUTC: utcMoment,
            createdBy: representativeEmail,
            modifiedAt: createdAt,
            modifiedAtUTC: utcMoment,
            modifiedBy: representativeEmail,
            version: version,
            encryptionLevel: encryptionLevel,
            title: title,
            metadata: metadata,
            isActive: 1,
            txId: txId,
            documentPath: documentPath,
            params: '',
            comments: comments,
        };

        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(docId, Buffer.from(stringify(sortKeysRecursive(document))));
        console.info('=========== CreateDocument End ===========');
    }

    // ReadDocument returns the Document stored in the world state with given representativeEmail.
    @Transaction(false)
    public async ReadDocument(ctx: Context, docId: string): Promise<string> {
        console.info('=========== ReadDocument Start ===========');
        const documentJSON = await ctx.stub.getState(docId); // get the asset from chaincode state
        if (!documentJSON || documentJSON.length === 0) {
            throw new Error(`The document ${docId} does not exist`);
        }
        return documentJSON.toString();
    }

    // UpdateDocument updates an existing Document in the world state with provided parameters.
    // "docId","dataHash","metadata","version","modifiedBy","modifiedAt","isActive","sharedWithList","title","docStatus","documentPath","params","comments","encryptionLevel"
    @Transaction()
    public async UpdateDocument(ctx: Context, docId: string, dataHash: string, metadata: string, version: string, modifiedBy: string, modifiedAt: string, isActive: string, sharedWithList: string, title: string, docStatus: string, documentPath: string, params: string, comments: string, encryptionLevel: string): Promise<void> {

        console.info('=========== UpdateDocument Start ===========');

        const exists = await this.DocumentExists(ctx, docId);
        if (!exists) {
            throw new Error(`The Document ${docId} does not exist`);
        }

        const txId: string = ctx.stub.getTxID(); 
        const utcMoment: string = moment.utc().toString();
        const documentString: string = await this.ReadDocument(ctx, docId);
        const document:Document = JSON.parse(documentString);

        let updatedDocument:Document = document

        if (dataHash != '' && dataHash != undefined) {
            updatedDocument.dataHash = dataHash
        }

        if (metadata != '' && metadata != undefined) {
            updatedDocument.metadata = metadata
        }
        
        if (version != '' && version != undefined) {
            updatedDocument.version = version
        }
        
        if (modifiedBy != '' && modifiedBy != undefined) {
            updatedDocument.modifiedBy = modifiedBy
        }
        
        if (modifiedAt != '' && modifiedAt != undefined) {
            updatedDocument.modifiedAt = modifiedAt
            updatedDocument.modifiedAtUTC = utcMoment;
        }
        
        if (isActive != '' && isActive != undefined) {
            updatedDocument.isActive = parseInt(isActive)
        }
        
        if (sharedWithList != '' && sharedWithList != undefined) {
            updatedDocument.sharedWithList = sharedWithList
        }

        if (title != '' && title != undefined) {
            updatedDocument.title = title
        }

        if (docStatus != '' && docStatus != undefined) {
            updatedDocument.docStatus = docStatus
        }else{
            updatedDocument.docStatus = 'update';
        }

        if (documentPath != '' && documentPath != undefined) {
            updatedDocument.documentPath = documentPath
        }

        if (params != '' && params != undefined) {
            updatedDocument.params = params
        }

        if (comments != '' && comments != undefined) {
            updatedDocument.comments = comments
        }

        if (encryptionLevel != '' && encryptionLevel != undefined) {
            updatedDocument.encryptionLevel = encryptionLevel
        }

        // 
        
        //////////////////////////
        //                      //
        //  Finally Update ...  // 
        //                      //
        //////////////////////////

        updatedDocument.txId = txId;

        console.log(updatedDocument)
        
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(docId, Buffer.from(stringify(sortKeysRecursive(updatedDocument))));

    }


    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteDocument(ctx: Context, docId: string): Promise<void> {
        console.info('=========== DeleteDocument Start ===========');
        const exists: boolean = await this.DocumentExists(ctx, docId);
        if (!exists) {
            throw new Error(`The document ${docId} does not exist`);
        }
        return ctx.stub.deleteState(docId);
    }


    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferDocument(ctx: Context, docId: string, newOwner: string): Promise<string> {
        console.info('=========== TransferDocument Start ===========');
        // Check creator User exist
        const userExist: boolean = await this.UserExists(ctx, newOwner);
        if (!userExist) {
            throw new Error(`The user ${newOwner} does not exist`);
        }

        const documentString: string = await this.ReadDocument(ctx, docId);
        const document:Document = JSON.parse(documentString);
        const oldCreator = document.createdBy;
        document.createdBy = newOwner;
        document.docStatus = 'newowner';
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(docId, Buffer.from(stringify(sortKeysRecursive(document))));
        return oldCreator;
    }

    // DocumentExists returns true when Document with given representativeEmail exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async DocumentExists(ctx: Context, docId: string): Promise<boolean> {
        console.info('=========== DocumentExists Start ===========');
        const documentJSON = await ctx.stub.getState(docId);
        return documentJSON && documentJSON.length > 0;
    }


    
    /** 
     * ************************ *
     *      OTHER SECTION       *
     * ************************ *
     */

    @Transaction(false)
    @Returns('string')
	public async QueryAssets(ctx: Context, queryString: string): Promise<string> {
        console.info('=========== QueryAssets Start ===========');
        console.info(`QueryString: ${queryString}`);
		return await this.GetQueryResultForQueryString(ctx, queryString);
	}

    // QueryAssetsWithPagination uses a query string, page size and a bookmark to perform a query
	@Transaction(false)
    @Returns('string')
	public async QueryAssetsWithPagination(ctx: Context, queryString: string, pageSize: number, bookmark?: string): Promise<string> {
        console.info('=========== QueryAssetsWithPagination Start ===========');
        console.info(`QueryString: ${queryString}`);
		const {iterator, metadata} = await ctx.stub.getQueryResultWithPagination(queryString, pageSize, bookmark);

        let results:PaginatedQueryResult = {};

		results.Records = await this._GetAllResults(iterator, false);
		results.FetchedRecordsCount = metadata.fetchedRecordsCount;
		results.Bookmark = metadata.bookmark;

		return JSON.stringify(results);
	}


    // GetAssetHistory returns the chain of custody for an asset since issuance.
    @Transaction(false)
    @Returns('string')
	public async GetHistory(ctx: Context, key: string): Promise<string> {
        console.info('=========== GetHistory Start ===========');
        console.info("KEY ", key);
		let resultsIterator = await ctx.stub.getHistoryForKey(key);
		let results = await this._GetAllResults(resultsIterator, true);

		return JSON.stringify(results);
	}

    // GetQueryResultForQueryString executes the passed in query string.
	// Result set is built and returned as a byte array containing the JSON results.
    @Transaction(false)
    @Returns('string')
	public async GetQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this._GetAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}

    public async _GetAllResults(iterator:any, isHistory:boolean): Promise<any> {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes: any = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.txId;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}
}
