const mysql = require('mysql2')

//Database Configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Example@2022#',
    database: 'sql_login'
})

connection.connect(function (error) {
    if (error) {
        console.log("Failed to connect to database.")
    } else {
        console.log("Connected to database succesfully!")
    }
})
//End of database connection

module.exports = connection