const fs = require('fs');
const child_process = require('child_process');
const readline = require('readline');

const basicProjectFiles = ['.env', '.gitignore', 'README.md', 'package.json'];

const basicProjectFolders = ['src', 'public'];
const srcFiles = ['server.js', 'app.js'];
const srcfolders = [
  'database',
  'controllers',
  'routes',
  'middlewares',
  'errors',
  'database/config',
  'database/queries',
  'utils',
  'utils/validation',
  'tests',
];

const databaseFiles = [
  'config/build.js',
  'config/build.sql',
  'config/connection.js',
  'queries/queries.js',
];

const controllerFiles = ['index.js', 'userController.js', 'authController.js'];

const middlewareFiles = ['verifyToken.js', 'errorHandler.js', 'index.js'];

const routeFiles = ['index.js', 'userRoutes.js', 'authRoutes.js'];
const errorFiles = ['customError.js'];

const testFiles = ['database.test.js', 'routes.test.js'];
const publicFolders = ['css', 'js', 'images'];
const publicFiles = ['index.html', 'css/styles.css', 'js/script.js', 'images/logo.png'];

const packages = [
  'dotenv',
  'express',
  'pg',
  'bcrypt',
  'joi',
  'cookie-parser',
  'cors',
  'compression',
  'helmet',
  'cross-env',
  'jsonwebtoken',
];
const devPackages = ['nodemon', 'jest', 'supertest', 'eslint'];

//Build .gitignore

const gitignore = ['node_modules', '.env'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//Build boilerplate

let project;

const buildBoilerplate = project => {
  //Build project folders
  console.log('Creating project folders...');

  basicProjectFolders.forEach(folder => {
    fs.mkdirSync(`${project}/${folder}`);
  });

  srcfolders.forEach(folder => {
    fs.mkdirSync(`${project}/src/${folder}`);
  });

  publicFolders.forEach(folder => {
    fs.mkdirSync(`${project}/public/${folder}`);
  });

  //Build project files
  console.log('Creating project files...');

  basicProjectFiles.forEach(file => {
    fs.writeFileSync(`${project}/${file}`, '', 'utf8');
  });

  //Build src files

  srcFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/${file}`, '', 'utf8');
  });

  writeAppFile();
  writeServerfile();

  //Build controller files

  controllerFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/controllers/${file}`, '', 'utf8');
  });

  //Build middleware files

  middlewareFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/middlewares/${file}`, '', 'utf8');
  });

  //Build route files

  routeFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/routes/${file}`, '', 'utf8');
  });

  //Build error files

  errorFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/errors/${file}`, '', 'utf8');
  });

  //Build database files

  databaseFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/database/${file}`, '', 'utf8');
  });

  writeBuildDatabaseFile();
  writeConfigDatabaseFile();

  //Build test files

  testFiles.forEach(file => {
    fs.writeFileSync(`${project}/src/tests/${file}`, '', 'utf8');
  });

  //Build public files

  publicFiles.forEach(file => {
    fs.writeFileSync(`${project}/public/${file}`, '', 'utf8');
  });

  writeHTMLFile(project);

  //Build package.json
  const packageJson = {
    name: project,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      start: 'cross-env NODE_ENV=production node src/server.js',
      dev: 'cross-env NODE_ENV=development nodemon src/server.js',
      build: 'cross-env NODE_ENV=development node src/database/config/build.js',
      test: 'jest',
    },
  };

  fs.writeFileSync(`${project}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8');

  gitignore.forEach(file => {
    fs.appendFileSync(`${project}/.gitignore`, `${file}\n`, 'utf8');
  });

  rl.question('Your PostgreSQL username: ', username => {
    rl.question('Your PostgreSQL password: ', password => {
      rl.question('Your PostgreSQL database name: ', database => {
        writeEnvFile(username, password, database);

        writeCustomErrorFile();
        writeErrorHandlerFile();
        //Build README.md

        const readme = `# Project Boilerplate Builder

    Thanks for using this boilerplate builder!

    Done by, [Abedalrahman Shamia](https://github.com/abedshamia)`;

        fs.writeFileSync(`${project}/README.md`, readme, 'utf8');

        rl.question('You want to install packages? (y/n) ', answer => {
          if (answer === 'y') {
            npmInstallPackages(packages);
            npmInstallDevPackages(devPackages);
            console.log('Done!');
            openProject();
          } else {
            openProject();
          }
        });

        // Open the project in visual studio code
        const openProject = () => {
          console.log('Opening project...');
          const command = `code ${project}`;
          child_process.execSync(command, {stdio: 'inherit'});
          rl.close();
        };
      });
    });
  });
};

function writeServerfile() {
  const appFile = `require('dotenv').config();
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
    `;

  fs.writeFileSync(`${project}/src/server.js`, appFile, 'utf8');
}

function writeAppFile() {
  const appFile = `
const { join } = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
app.use(cookieParser());
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, '..', 'public')));
app.use(express.json());
app.use(helmet());
app.use(cors());


app.use(errorHandler);

module.exports = app;
`;

  fs.writeFileSync(`${project}/src/app.js`, appFile, 'utf8');
}

function writeConfigDatabaseFile() {
  const connection = `
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
    `;
  fs.writeFileSync(`${project}/src/database/config/connection.js`, connection, 'utf8');
}

function writeBuildDatabaseFile() {
  const build = `require('dotenv').config();
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
 `;

  fs.writeFileSync(`${project}/src/database/config/build.js`, build, 'utf8');
}

function writeHTMLFile(project) {
  const htmlFile = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${project}</title>
        <link rel="stylesheet" href="./css/styles.css" />
      </head>
      <body>
        <script src="./js/script.js"></script>
      </body>
    </html>
    `;

  fs.writeFileSync(`${project}/public/index.html`, htmlFile, 'utf8');
}

function npmInstallPackages(packages) {
  console.log('Installing packages...');

  const command = `cd ${project} && npm install ${packages.join(' ')} --save`;
  child_process.execSync(command, {stdio: 'inherit'});
}

function npmInstallDevPackages(packages) {
  console.log('Installing dev packages...');
  const command = `cd ${project} && npm install ${packages.join(' ')} --save-dev`;
  child_process.execSync(command, {stdio: 'inherit'});

  console.log('Done!');
}
rl.question('What is your project name? ', projectName => {
  console.log(`Creating project ${projectName}...`);
  projectName = projectName.replace(/\s/g, '_');
  const command = `mkdir ${projectName}`;
  child_process.execSync(command, {stdio: 'inherit'});

  project = projectName.toLowerCase().replace(/\s/g, '_');
  buildBoilerplate(project);
});

function writeEnvFile(username, password, database_name) {
  const envFile = `DEV_DATABASE_URL=postgres://${username}:${password}@localhost:5432/${database_name}
DATABASE_URL=postgres://${username}:${password}@localhost:5432/${database_name}
TEST_DATABASE_URL=postgres://${username}:${password}@localhost:5432/${database_name}_test
JWT_SECRET=Shhh Secret`;

  fs.writeFileSync(`${project}/.env`, envFile, 'utf8');
}

function writeCustomErrorFile() {
  const errorFile = `
    const createError = (message, code) => {
        const error = new Error(message);
        error.code = code;
        return error;
      };
      
      module.exports = {createError};
      `;

  fs.writeFileSync(`${project}/src/errors/customError.js`, errorFile, 'utf8');
}

function writeErrorHandlerFile() {
  const errorHandler = `const errorHandler = (err, req, res, next) => {
    if (err.code) {
      res.status(err.code).json({
        status: err.code,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: err.message,
      });
    }
  };
  
  module.exports = errorHandler;
  `;

  fs.writeFileSync(`${project}/src/middlewares/errorHandler.js`, errorHandler, 'utf8');
}
