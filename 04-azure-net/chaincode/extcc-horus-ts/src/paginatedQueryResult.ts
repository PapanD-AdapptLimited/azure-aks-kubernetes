
/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';
import { User } from './user';

@Object()
export class PaginatedQueryResult {
    @Property()
    public Records?: User[];

    @Property()
    public FetchedRecordsCount?: number;

    @Property()
    public Bookmark?: string;
}
