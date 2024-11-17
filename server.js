require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');


const http = require('http');//.createServer(app);
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Socket.IO mit dem HTTP-Server verbinden
//const io = require('socket.io')(http);
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');


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

// Index page (static HTML)
app.route('/')
  //.use((req, res) => res.setHeader('X-Powered-By', 'PHP 7.4.3'))
  .get(function (req, res) {
    res.setHeader('X-Powered-By', 'PHP 7.4.3')
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);

function getRanKoord(max = 100) {
   let pos = Math.floor(Math.random() * max);
   return pos;
}
// Server-Seite
let currentUsers = 0;
const canvasWidth = 640;
const canvasHeight = 480;
let players = {}; // Objekt zur Speicherung der Spielerpositionen
let start_collect = { x: getRanKoord(canvasWidth), y: getRanKoord(canvasHeight), q: 10} ;
let id_iter = 1;
let start_player = {}


function getRandomColor() {
	// Zufällige Werte für Rot, Grün und Blau generieren
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
    	color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}


io.on('connection', socket => {
    console.log('Ein Spieler hat sich verbunden');
    
    ++currentUsers;
    io.emit('user count', currentUsers);

    // Beim Verbinden des Clients einen neuen Spieler hinzufügen
	//start_player = { id: id_iter, x: getRanKoord(canvasWidth), y:  getRanKoord(canvasHeight), q: 20, score: 0, speedX: 0, speedY: 0 }
    players[socket.id] = { id: id_iter, x: getRanKoord(canvasWidth), y:  getRanKoord(canvasHeight), q: 20, score: 0, speedX: 0, speedY: 0, colour: getRandomColor() };
	io.emit('start player', {id: id_iter, colour: players[socket.id].colour, x: players[socket.id].x, y: players[socket.id].y});
	id_iter++;
    io.emit('players update', players); // Sendet das Spieler-Array an alle Clients
            
    io.emit('start collect', start_collect); // Sendet den Start-Coin an alle Clients

    // Listener für Spielerupdates vom Client
    socket.on('player update', (playerData) => {
        if (players[socket.id]) {
            // Aktualisiere den Spieler mit den neuen Koordinaten
            players[socket.id] = { ...players[socket.id], ...playerData };
            io.emit('players update', players); // An alle Clients senden
        }
    });
    // Listener für Spielerupdates vom Client
    socket.on('collected', (collect) => {
        if (collect.collision) {
            // Aktualisiere den Spieler mit den neuen Koordinaten
			collect.player_score++;
			
			let random_num = 1;
			if(collect.player_score % 10 == 0){ random_num = Math.floor(Math.random()*10);}
			for(let i = 0; i < random_num; i++){
                let new_collect = { x: getRanKoord(canvasWidth), y: getRanKoord(canvasHeight), q: 10, id: collect.player_id, score: collect.player_score} ;
                io.emit('del collect', collect); // An alle Clients senden
                io.emit('new collect', new_collect); // An alle Clients senden
			}
        }
    });

    // Beim Trennen des Clients den Spieler entfernen
    socket.on('disconnect', () => {
        console.log('Ein Spieler hat sich getrennt');
        delete players[socket.id]; // Entfernt den Spieler aus dem Objekt
        --currentUsers;
        io.emit('user count', currentUsers);
        io.emit('players update', players); // An alle Clients senden
    });
});



/*
let currentUsers = 0;

  io.on('connection', socket => {
		console.log('A user has connected');
		
		//console.log('user ' + socket.request.user.username + ' connected');
		//console.log('user ' + socket.request.user.username + ' connected');
		++currentUsers;
		io.emit('user count', currentUsers);
		
        io.on('player update', (player) => {
		    io.emit('player back update', player);
	    });
        socket.on('disconnect', () => {
			console.log('A user has disconnected');
		    --currentUsers;
		io.emit('user', {
			currentUsers
		});
		});
  
  });
  */
    
	

	
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
	.setHeader('X-Powered-By', 'PHP 7.4.3')
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
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
