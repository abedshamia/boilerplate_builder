const fs = require('fs');
const child_process = require('child_process');
const readline = require('readline');

const basicProjectFiles = ['.env', '.gitignore', 'README.md', 'package.json'];

const basicProjectFolders = ['server', 'client'];
const serverFiles = ['server.js', 'app.js'];
const serverfolders = [
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
  'jsonwebtoken',
];
const devPackages = ['nodemon', 'jest', 'supertest', 'eslint', 'cross-env'];

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

  serverfolders.forEach(folder => {
    fs.mkdirSync(`${project}/server/${folder}`);
  });

  //Build project files
  console.log('Creating project files...');

  basicProjectFiles.forEach(file => {
    fs.writeFileSync(`${project}/${file}`, '', 'utf8');
  });

  //Build server files

  serverFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/${file}`, '', 'utf8');
  });

  writeAppFile();
  writeServerfile();

  //Build controller files

  controllerFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/controllers/${file}`, '', 'utf8');
  });

  //Build middleware files

  middlewareFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/middlewares/${file}`, '', 'utf8');
  });

  //Build route files

  routeFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/routes/${file}`, '', 'utf8');
  });

  //Build error files

  errorFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/errors/${file}`, '', 'utf8');
  });

  //Build database files

  databaseFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/database/${file}`, '', 'utf8');
  });

  writeBuildDatabaseFile();
  writeConfigDatabaseFile();

  //Build test files

  testFiles.forEach(file => {
    fs.writeFileSync(`${project}/server/tests/${file}`, '', 'utf8');
  });

  //Build package.json
  const packageJson = {
    name: project,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      start: 'cross-env NODE_ENV=production node server/server.js',
      dev: 'cross-env NODE_ENV=development nodemon server/server.js',
      build: 'cross-env NODE_ENV=development node server/database/config/build.js',
      test: 'jest',
      'heroku-postbuild': 'cd client && npm install && npm run build',
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
            rl.question('You want to install react? (y/n) ', answer => {
              if (answer === 'y') {
                // run npm create-react-app
                console.log('Creating react app...');
                const command = `cd ${project}/client && yarn create react-app .`;
                child_process.execSync(command, {stdio: 'inherit'});
                console.log('Installed react app!');

                console.log('Installing react-router-dom...');
                const reactRouterCommand = `cd ${project}/client && yarn add react-router-dom@4.3.1`;
                child_process.execSync(reactRouterCommand, {stdio: 'inherit'});
                openProject();
              } else {
                publicFolders.forEach(folder => {
                  fs.mkdirSync(`${project}/client/${folder}`);
                });
                //Build public files

                publicFiles.forEach(file => {
                  fs.writeFileSync(`${project}/client/${file}`, '', 'utf8');
                });

                writeHTMLFile(project);

                openProject();
              }
            });
          } else {
            openProject();
          }
        });

        // Open the project in visual studio code
        const openProject = () => {
          console.log(`
          Thank you for using my boilerplate builder!
          Done by, Abedalrahman Shamia
          `);
          const command = `code ${project}`;

          setTimeout(() => {
            child_process.execSync(command, {stdio: 'inherit'});
            rl.close();
          }, 1500);
        };
      });
    });
  });
};

function writeServerfile() {
  const appFile = `require('dotenv').config();
    const app = require('./app');
    const connection = require('./database/config/connection');
    
    const PORT = process.env.PORT || 3001;
    
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

  fs.writeFileSync(`${project}/server/server.js`, appFile, 'utf8');
}

function writeAppFile() {
  const appFile = `
const { join } = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
app.use(cookieParser());
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


if(process.env.NODE_ENV === 'production') {
app.use(express.static(join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'build', 'index.html'));
});
}


app.use(errorHandler);

module.exports = app;
`;

  fs.writeFileSync(`${project}/server/app.js`, appFile, 'utf8');
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
  fs.writeFileSync(`${project}/server/database/config/connection.js`, connection, 'utf8');
}

function writeBuildDatabaseFile() {
  const build = `require('dotenv').config();
  const fs = require('fs');
  const connection = require('./connection');
  
  const sqlFile = fs.readFileSync('./server/database/config/build.sql', 'utf8');
  
  connection.query(sqlFile, (err, res) => {
    if (err) {
      console.log('Error creating tables: ', err);
    }
  
    console.log('Tables created successfully');
  });
  
  connection.end();
 `;

  fs.writeFileSync(`${project}/server/database/config/build.js`, build, 'utf8');
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
        <script server="./js/script.js"></script>
      </body>
    </html>
    `;

  fs.writeFileSync(`${project}/client/index.html`, htmlFile, 'utf8');
}

function npmInstallPackages(packages) {
  console.log('Installing packages...');

  const command = `cd ${project} && yarn add ${packages.join(' ')}`;
  child_process.execSync(command, {stdio: 'inherit'});
}

function npmInstallDevPackages(packages) {
  console.log('Installing dev packages...');
  const command = `cd ${project} && yarn add ${packages.join(' ')} -D`;
  child_process.execSync(command, {stdio: 'inherit'});

  console.log('Done!');
}
rl.question('What is your project name? ', projectName => {
  console.log(`Creating project ${projectName}...`);
  projectName = projectName.replace(/\s/g, '_').toLowerCase();
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

  fs.writeFileSync(`${project}/server/errors/customError.js`, errorFile, 'utf8');
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

  fs.writeFileSync(`${project}/server/middlewares/errorHandler.js`, errorHandler, 'utf8');
}
