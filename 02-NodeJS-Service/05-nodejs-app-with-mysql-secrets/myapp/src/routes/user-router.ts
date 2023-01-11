import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import mysql, { MysqlError, PoolConnection, queryCallback } from 'mysql';
import logger from 'jet-logger';
//import userService from '@services/user-service';
import { ParamMissingError } from '@shared/errors';
import os from 'os';


// Constants
const router = Router();
const { CREATED, OK, INTERNAL_SERVER_ERROR } = StatusCodes;
const pool = mysql.createPool({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, // max number of connection
    multipleStatements: true
});

pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
    if(err){
        logger.err(err)
    }
    logger.info("MySQL Database connection successful!")
    const sqlQuery = `CREATE TABLE IF NOT EXISTS users (
        id BIGINT(20) AUTO_INCREMENT primary key NOT NULL, 
        name VARCHAR(255) DEFAULT NULL, 
        email VARCHAR(255) DEFAULT NULL
    )`; 
    conn.query(sqlQuery, function(err:any, rows:any){
        if(err){
            logger.err(err)
        }
        //console.log(rows)
    })
    conn.release()
})

// Paths
export const p = {
    get: '/all',
    add: '/add',
    update: '/update',
    delete: '/delete/:id',
    k8sinfo: '/info',
} as const;

/**
 * Get k8s info.
 */
router.get(p.k8sinfo, async (_: Request, res: Response) => {
    const hostname = os.hostname()
    return res.status(OK).json({hostname});
});


/**
 * Get all users.
 */
router.get(p.get, async (_: Request, res: Response) => {
    let users:any = new Array();
    pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
        if(err){
            conn.release()
            logger.err(err);
            throw err;
        }
        //logger.info("<DB-CONN-SUCCESS>");
        const sqlQuery = `SELECT * FROM users`; 
        conn.query(sqlQuery, (err:MysqlError, results:any) =>{
            if(err){
                logger.err(err)
                throw err;
            }
            conn.release()

            for(let result of results) {
                users.push({
                    name: result.name,
                    email: result.email,
                    id: result.id
                })
            }
            //console.log(users)
            return res.status(OK).json({users})
        })
        
    })
    //const users = await userService.getAll();
    //return res.status(OK).json({users});
});


/**
 * Add one user.
 */
router.post(p.add, async (req: Request, res: Response) => {
    const { user } = req.body;
    // Check param
    if (!user) {
        throw new ParamMissingError();
    }

    pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
        if(err){
            logger.err(err);
            throw err;
        }
        const sqlQuery = `INSERT INTO users (name, email)
            VALUES('${user.name}', '${user.email}')`; 
        conn.query(sqlQuery, function(err:any, rows:any){
            if(err){
                logger.err(err);
                throw err;
            }
            conn.release();
            return res.status(CREATED).end();
        })
    })
    // Fetch data
    // await userService.addOne(user);
    
});


/**
 * Update one user.
 */
router.put(p.update, async (req: Request, res: Response) => {
    const { user } = req.body;
    // Check param
    if (!user) {
        throw new ParamMissingError();
    }
    // Fetch data
    // await userService.updateOne(user);
    pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
        if(err){
            logger.err(err);
            throw err;
        }
        const sqlQuery = `UPDATE users SET name='${user.name}', email='${user.email}' WHERE id=${Number(user.id)}`; 
        conn.query(sqlQuery, function(err:any, rows:any){
            if(err){
                logger.err(err);
                throw err;
            }
            conn.release();
            return res.status(OK).end();
        })
    })
});


/**
 * Delete one user.
 */
router.delete(p.delete, async (req: Request, res: Response) => {
    const { id } = req.params;
    // Check param
    if (!id) {
        throw new ParamMissingError();
    }
    // Fetch data
    //await userService.delete(Number(id));
    
    pool.getConnection((err:MysqlError, conn:PoolConnection)=>{
        if(err){
            logger.err(err);
            throw err;
        }
        const sqlQuery = `DELETE FROM users WHERE id=${Number(id)}`; 
        conn.query(sqlQuery, function(err:any, rows:any){
            if(err){
                logger.err(err);
                throw err;
            }
            conn.release();
            return res.status(OK).end();
        })
    })
});


// Export default
export default router;
