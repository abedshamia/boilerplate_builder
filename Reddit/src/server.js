require('dotenv').config();
    const app = require('./app');
    const connection = require('./database/config/connection');
    
    const PORT = process.env.PORT || 3000;
    
    const start = async () => {
      try {
        await connection.connect();
        console.log('Connected to the database');
        app.listen(PORT, () => {
          console.log('App listening on port ' + PORT);
        });
      } catch (err) {
        console.log(err);
      }
    };
    
    start();
    