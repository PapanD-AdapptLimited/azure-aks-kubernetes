
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class Db {
	constructor(config) {
		
		this.connection = mysql.createPool({
			connectionLimit: 100,
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			debug: false
		});

		this.checkConnection();
	}

	checkConnection() {
        this.connection.getConnection((err, connection) => {
			if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.');
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.');
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.');
                }
            }
            if (connection) {
				console.log("MySQL Database connected ... ");
                connection.release();
            }
            return
        });
    }

	reset(){
		return new Promise((resolve, reject) => {
			const rl = readline.createInterface({
				input: fs.createReadStream(path.resolve(__dirname, 'create-db.sql')),
				terminal: false
			})
			rl.on('line', function(chunk){
				console.log("====================")
				console.log(chunk.toString('ascii'))
				console.log("====================")
				this.connection.query(chunk.toString('ascii'), (err, rows) => {
					if(err) return reject(err);
				})
			})
			rl.on('close', ()=>{
				console.log('Finished setting up DB ... ')
				resolve()
			})
		})
	}
	// connect(){
	// 	return new Promise((resolve, reject) => {
	// 		this.connection.connect(err => {
	// 			if (err)
	// 				return reject(err);
	// 			console.log("DB connected...")
	// 			resolve();
	// 		});
	// 	});
	// }
	query(sql, args) {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err, rows) => {
				if (err)
					return reject(err);
				resolve(rows);
			});
		});
	}
	close() {
		return new Promise((resolve, reject) => {
			this.connection.end(err => {
				if (err)
					return reject(err);
				resolve();
			});
		});
	}
}
module.exports = new Db();