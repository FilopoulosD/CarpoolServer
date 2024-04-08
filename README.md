#Carpool

This is the Node.js server files with the database code.

To run it you'll need a MySQL database and the following files:

important files

.env file with the following format:

API_KEY = {your Google Maps API key}

JS_TOKEN_KEY = {your JSON Web Token key}

DB_HOST = '{database hostname}'

DB_USER = '{database username}'

DB_PASSWORD = '{database password}'

DB_DATABASE = '{database name}'

DB_PORT = {database port}

A folder named cert with the following files:

certificate.pem key.pem

These files contain the certificate and the private key for SSL!
