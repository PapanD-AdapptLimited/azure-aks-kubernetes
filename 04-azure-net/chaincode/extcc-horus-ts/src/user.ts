/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class User {
    @Property()
    public docType?: string;

    @Property()
    public representativeName: string;

    @Property()
    public representativeEmail: string;

    @Property()
    public representativePassword: string;

    @Property()
    public representativeRole: string;

    @Property()
    public representativeOrganisation: string;

    @Property()
    public createdBy: string;

    @Property()
    public createdAt: string;

    @Property()
    public createdAtUTC: string;

    @Property()
    public lastLogin: string;

    @Property()
    public lastLoginUTC: string;

    @Property()
    public isActive: number;

    @Property()
    public params: string;
}
