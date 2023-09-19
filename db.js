import sqlite3 from "sqlite3"

function desirialise(data) {
    if (!data) {
        return data;
    }
    return {
        id: data.id,
        request: {
            method: data.method,
            isSecure: data.isSecure,
            host: data.host,
            path: data.path,
            headers: data.headersReq,
            cookies: data.cookies,
            get_params: data.getParams,
            post_params: data.postParams
        },
        response: {
            code: data.code,
            message: data.message,
            headers: data.headersRes,
            body: data.body
        }
    }
}

class Db {
    constructor() {
        this.db = new sqlite3.Database('database.sqlite3', (err) => {
            if (err) {
                console.log('Could not connect to database', err.message)
            } else {
                console.log('Connected to database')
            }

            this.db.run(`CREATE TABLE IF NOT EXISTS requests (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                method      TEXT,
                isSecure    BOOLEAN,
                host        INTEGER,
                path        TEXT,
                headersReq  TEXT,
                cookies     TEXT,
                getParams   TEXT,
                postParams  TEXT
                ) `);
            this.db.run(`CREATE TABLE IF NOT EXISTS responses (
                id          INTEGER,
                code        INTEGER,
                message     TEXT,
                headersRes  TEXT,
                body        TEXT,
                FOREIGN KEY (id)  REFERENCES requests (id)
            )`);
        });
    }

    insertRequest(method, isSecure, host, path, headers, cookies, getParams, postParams) { 
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT id FROM requests ORDER BY id DESC`, (err, data) => {
                this.db.run(`INSERT INTO requests 
                (method, isSecure, host, path, headersReq, cookies, getParams, postParams) VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?)`, [method, isSecure, host, path, headers, cookies, getParams, postParams]);
                if (data) {
                    resolve(data.id + 1);
                } else {
                    resolve(1);
                }
            });
        })
    }

    insertResponse(id, code, message, headers, body) {
        this.db.run(`INSERT INTO responses (id, code, message, headersRes, body) VALUES 
            (?, ?, ?, ?, ?)`, [id, code, message, headers, body]);
    }

    getInfoById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM requests JOIN responses ON  
            requests.id = responses.id WHERE requests.id = ?`, [id], (err, data) => {
                resolve(desirialise(data));
            })
        });
    }

    getAllInfo() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM requests JOIN responses ON  
            requests.id = responses.id`, (err, data) => {
                resolve(Array.from(data, elem => desirialise(elem)));
            });
        });
    }
}

export const Database = new Db();
