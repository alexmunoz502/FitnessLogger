var mysql = require('mysql');
var pool = mysql.createPool(
    {
        connectionLimit : 10,
        host            : 'classmysql.engr.oregonstate.edu',
        user            : 'cs290_munozale',
        password        : '7592',
        database        : 'cs290_munozale'
    }
);
module.exports.pool = pool;