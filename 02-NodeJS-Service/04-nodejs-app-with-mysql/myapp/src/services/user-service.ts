import userRepo from '@repos/user-repo';
import { IUser } from '@models/user-model';
import { UserNotFoundError } from '@shared/errors';
import mysql, { MysqlError, PoolConnection, queryCallback } from 'mysql';
import logger from 'jet-logger';

var pool = mysql.createPool({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, // max number of connection
    multipleStatements: true
});



/**
 * Get all users.
 * 
 * @returns 
 */
function getAll(): Promise<IUser[]> {
    return userRepo.getAll();
}


/**
 * Add one user.
 * 
 * @param user 
 * @returns 
 */
function addOne(user: IUser): Promise<void> {
    pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
        if(err){
            logger.err(err);
            throw err;
        }
        logger.info("<DB-CONN-SUCCESS>");
        const sqlQuery = `INSERT INTO users (name, email)
            VALUES('${user.name}', '${user.email}')`; 
        conn.query(sqlQuery, function(err:any, rows:any){
            if(err){
                logger.err(err)
            }
            console.log(rows)
        })
        conn.release()
    })
    return userRepo.add(user);
}


/**
 * Update one user.
 * 
 * @param user 
 * @returns 
 */
async function updateOne(user: IUser): Promise<void> {
    const persists = await userRepo.persists(user.id);
    if (!persists) {
        throw new UserNotFoundError();
    }
    return userRepo.update(user);
}


/**
 * Delete a user by their id.
 * 
 * @param id 
 * @returns 
 */
async function deleteOne(id: number): Promise<void> {
    const persists = await userRepo.persists(id);
    if (!persists) {
        throw new UserNotFoundError();
    }
    return userRepo.delete(id);
}


// Export default
export default {
    getAll,
    addOne,
    updateOne,
    delete: deleteOne,
} as const;
