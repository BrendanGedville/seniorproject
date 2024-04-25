const mariadb = require('mariadb');


const dbConfig = {
    host: 'un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com', 
    user: 'p3opsbkosw4r2e0w', 
    password: 'fijtps4yo7z4ne3n', 
    database: 'bqvvpiz2dxr0cbtl',
    connectionLimit: 10
};


console.log(dbConfig);

const pool = mariadb.createPool(dbConfig);

module.exports = pool;

mysql://p3opsbkosw4r2e0w:fijtps4yo7z4ne3n@un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/bqvvpiz2dxr0cbtl