const mariadb = require('mariadb');

// Define your database configuration directly
const dbConfig = {
    host: 'localhost', // Replace 'your_db_host' with your actual database host
    user: 'pm_user', // Replace 'your_db_user' with your actual database user
    password: 'your_password', // Replace 'your_db_password' with your actual database password
    database: 'password_manager', // Replace 'your_db_name' with your actual database name
    connectionLimit: 10
};

// Logging the database configuration (remove or comment this line in production for security reasons)
console.log(dbConfig);

const pool = mariadb.createPool(dbConfig);

module.exports = pool;
