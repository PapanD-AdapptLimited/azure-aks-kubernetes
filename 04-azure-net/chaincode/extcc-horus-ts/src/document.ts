/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Document {
    @Property()
    public docType?: string;

    @Property()
    public docId: string;

    @Property()
    public docStatus: string;

    @Property()
    public dataHash: string;

    @Property()
    public sharedWithList?: string;

    @Property()
    public createdAt: string;

    @Property()
    public createdAtUTC: string;

    @Property()
    public createdBy: string;

    @Property()
    public modifiedAt: string;

    @Property()
    public modifiedAtUTC: string;

    @Property()
    public modifiedBy: string;

    @Property()
    public version: string;

    @Property()
    public encryptionLevel: string;

    @Property()
    public title: string;

    @Property()
    public metadata: string;

    @Property()
    public isActive: number;

    @Property()
    public txId: string;

    @Property()
    public documentPath: string;

    @Property()
    public params?: string;

    @Property()
    public comments: string;
}
