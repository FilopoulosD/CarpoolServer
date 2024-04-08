var mysql = require('mysql');


require('dotenv').config();

//database credentials import from .env file
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

// Connection ith database
var db=mysql.createConnection({
    host:DB_HOST, 
    user:DB_USER, 
    password:DB_PASSWORD, 
    database:DB_DATABASE, 
    port: DB_PORT,
    typeCast: function castField( field, useDefaultTypeCasting ) {
      if ( ( field.type === "BIT" ) && ( field.length === 1 ) ) {
        var bytes = field.buffer();
        return( bytes[ 0 ] === 1 );
      }
  
      return( useDefaultTypeCasting() );
  
    }
  });
  



module.exports = { db: db };