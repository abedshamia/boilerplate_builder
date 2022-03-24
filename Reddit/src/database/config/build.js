require('dotenv').config();
  const fs = require('fs');
  const connection = require('./connection');
  
  const sqlFile = fs.readFileSync('./src/database/config/build.sql', 'utf8');
  
  connection.query(sqlFile, (err, res) => {
    if (err) {
      console.log('Error creating tables: ', err);
    }
  
    console.log('Tables created successfully');
  });
  
  connection.end();
 