
  const { Pool } = require("pg");
    const { NODE_ENV, DATABASE_URL, DEV_DATABASE_URL, TEST_DATABASE_URL} = process.env;
    let URL;
    let SSL;
    
    switch (NODE_ENV) {
      case "development":
        URL = DEV_DATABASE_URL;
        SSL = false;
        break;
      case "production":
        URL = DATABASE_URL;
        SSL = { rejectUnauthorized: false };
        break;
        case "test":
        URL = TEST_DATABASE_URL;
        SSL = false;
        break;
      default:
        throw new Error("NODE_ENV is not set");
    }
    
    const connection = new Pool({
      connectionString: URL,
      ssl: SSL,
    });
    
    module.exports = connection;
    