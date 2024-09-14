require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
//const request = require('request')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();


app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
//app.use((req, res) => res.setHeader('X-Powered-By', 'PHP 7.4.3'));
//app.use(helmet.hidePoweredBy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});


//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

//app.get("/", (req, res) => {
//	res.setHeader('X-Powered-By', 'PHP 7.4.3');   
//});

// Index page (static HTML)
app.route('/')
  //.use((req, res) => res.setHeader('X-Powered-By', 'PHP 7.4.3'))
  .get(function (req, res) {
    res.setHeader('X-Powered-By', 'PHP 7.4.3')
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
	.setHeader('X-Powered-By', 'PHP 7.4.3')
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
