import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


    const socket = io(); // Verbindung zu Socket.IO herstellen

    socket.on('user count', (count) => {
      console.log(count);
	  //document.getElementById('userCount').textContent = 'Current Users: ' + count;
    });
	
	socket.on('user', (data) => {
		/*anything you want to do on disconnect*/
		console.log(data.currentUsers);
		console.log("erfwsfsfr");
		});
	
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const canvasWidth = 640;
const canvasHeight = 480;
const border = 10;
const title = 50; 
//alert("eingebunden");

function draw(squareX, squareY, squareSize) {
    let context = canvas.getContext('2d');

    context.fillStyle = '#dfac20';
    context.fillRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);
    context.lineWidth = 3;
    context.strokeStyle = '#39F3ab';
    context.strokeRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);	
  }

function drawLine(x1, y1, x2, y2) {
    let context = canvas.getContext('2d');
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
	context.stroke();
}

function drawGrid(){
//alert("drawGrid "+ canvasHeight+ "  " + canvasWidth);
for(let i = 0; i <= canvasHeight; i += 10){
     drawLine(0, i, canvasWidth, i);
	}
   for(let j = 0; j <= canvasWidth; j += 10){
     drawLine(j, 0, j, canvasHeight);
   }
}


function getRanKoord(max = 100) {
   let pos = Math.floor(Math.random() * max);
   return pos;
}

//kopiert von https://wiki.selfhtml.org/wiki/JavaScript/Canvas/Animation
//x = 0, y = 20, q = 20, , speedX = xMax / 10000, speedY = yMax / 10000, q_rand = q/2
let  xMax = canvas.clientWidth, yMax = canvas.clientHeight, lastTimestamp = -1;

//let collx = getRanKoord(canvas.clientWidth), colly = getRanKoord(canvas.clientHeight), collSize = 10;

const players = {}; // Hier werden die Spieler gespeichert, die vom Server gesendet werden

// Hört auf 'players update', um die Spieler-Positionen zu aktualisieren
socket.on('players update', (updatedPlayers) => {
    // Kopiere die aktualisierten Spieler in das lokale players-Objekt
	let board_content = "";
    Object.keys(updatedPlayers).forEach(id => {
	    //console.log(id);
        if (!players[id]) {
            players[id] = new Player(updatedPlayers[id]); // Neuer Spieler
        } else {
            // Aktualisiere die Position und andere Daten des Spielers
            Object.assign(players[id], updatedPlayers[id]);
            board_content += "<p style='color: "+players[id].id.colour+";'>Spieler "+players[id].id +"- Punkte "+players[id].score +"</p>";
		}
    });
    
    document.getElementById("scoreboard").innerHTML = board_content;
    // Entferne Spieler, die nicht mehr im updatedPlayers-Objekt sind
    Object.keys(players).forEach(id => {
        if (!updatedPlayers[id]) delete players[id];
    });
});

let collect; // Define the collectible
let all_collects = []; // Define the collectible

// Listen for 'start collect' event from server to spawn a collectible
socket.on('start collect', (start_collect) => {
    console.log('start Collectible received:', start_collect);
    let q_rand = start_collect.q / 2; // Random size factor based on server data

    // Create a new collectible at the specified position and size
    all_collects.push(new Collectible({
        x: start_collect.x - q_rand,
        y: start_collect.y - q_rand,
        q: start_collect.q
    }));
	console.log(all_collects);
    all_collects.forEach(col => col.draw() ); // Draw the new collectible on the canvas
});

socket.on('del collect', (collect) => {
    all_collects.forEach((col, i) => {
    if(col.x == collect.x && col.y == collect.y) {
	    all_collects.splice(i,1);
		
	}
    }); // Draw the new 
});

// Generate new collectible at a random position
socket.on('new collect', (new_collect) => {
      console.log('new Collectible received:', new_collect);
      let q_rand = new_collect.q / 2; // Random size factor based on server data

      // Create a new collectible at the specified position and size
      all_collects.push(new Collectible({
        x: new_collect.x - q_rand,
        y: new_collect.y - q_rand,
        q: new_collect.q
    }));
	all_collects.forEach(col => col.draw()); // Draw the new collectible on the canvas
});

  let player = new Player({ id: 0, x: 0, y: 20, q: 20, score: 0, speedX: xMax / 10000, speedY: yMax / 10000 });

// Listen for 'start collect' event from server to spawn a collectible
socket.on('start player', (start_player) => {
    console.log('start Player received:', start_player);
    let title_content = "";
    // Create a new Player at the specified position and size
    if(player.id == 0){
	    player.id = start_player.id// = new Player(start_player);
		player.colour = start_player.colour;
		player.x = start_player.x;
		player.y = start_player.y;
	}
	title_content += "<h1 style='color: "+player.colour+"; text-decoration: underline;'>Spieler "+player.id +"</h1>";
	console.log(player);
	
    document.getElementById("player_display").innerHTML = title_content;
    player.draw(); // Draw the new collectible on the canvas
});


  function animate(timestamp) {
    // Quadrat an der neuen Position zeichnen
	
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    player.move(timestamp, lastTimestamp, xMax, yMax);
    
    socket.emit('player update', {
        x: player.x,
        y: player.y,
        q: player.q,
        score: player.score,
        id: player.id,
        speedX: player.speedX,
        speedY: player.speedY
    })
     // Alle Spieler zeichnen
    Object.values(players).forEach(player => player.draw());

    // Kollektion (Collectible) zeichnen und prüfen, ob der Spieler sie einsammelt
    /*collect.draw();
    if (player.collision(collect)) {
        collect = new Collectible({
            x: getRanKoord(canvas.clientWidth - collect.q_rand),
            y: getRanKoord(canvas.clientHeight - collect.q_rand),
            q: 20
        });
    }
	socket.emit('player update', { id: player.id, x: player.x, y: player.y, q: player.q, score: player.score, speedX: player.speedX, speedY: player.speedY });
	*/
	socket.on('player back update', (player1) => {
	    console.log(player1.id, player1.x, player1.y)
	    
		let player = new Player(player1); 
		player.draw();
	
	});

      // Draw collectible and check for collection by player
    all_collects.forEach((col,i) => {
    if (col) { // Ensure collectible exists
        col.draw();
        
        // Check if player collides with collectible
	    if (player.collision(col)) {
            player.score++;
			player.q *= 1.25;
			if(player.score % 5 == 0){
				player.speedX *= 1.1;
				player.speedY *= 1.1;
			}
			if(player.score % 20 == 18){
				player.speedX /= (1.1*4);
				player.speedY /= (1.1*4);
				player.q = 10;
			}
			// Notify server that the collectible was collected
            socket.emit('collected', {
                x: col.x,
                y: col.y,
                q: col.q,
				collision: true,
				player_id: player.id,
				player_score: player.score
            });
        
      
        }}
    });
   
	//draw(x - ( x % 10), y - ( y % 10), q);
	//draw(collx - ( collx % 10), colly - ( colly % 10), collSize);
	drawGrid();
    // Zeitpunkt merken um im nächsten Schritt die Zeitdifferenz zu bestimmen
    lastTimestamp = timestamp;
    // Aufruf für den nächsten Animationsframe registrieren
    requestAnimationFrame(animate);
  }
  
  //x = 0, y = 20, q = 20, xMax = canvas.clientWidth - q, yMax = canvas.clientHeight, speedX = xMax / 10000, speedY = yMax / 10000, lastTimestamp = -1, q_rand = q/2;
  //let i = 1;
  //let player = new Player({ id: i, x: 0, y: 20, q: 20, score: 0, speedX: xMax / 10000, speedY: yMax / 10000 });
  
//let collx = getRanKoord(canvas.clientWidth), colly = getRanKoord(canvas.clientHeight), collSize = 10;

  //let collect = new Collectible({ x: getRanKoord(canvas.clientWidth), y: getRanKoord(canvas.clientHeight), q: 20});
  

document.getElementById("game-window").addEventListener("keydown", (event) => {
    alert(event.code);

});


  requestAnimationFrame(animate);
  
/*
 setInterval(function () {
    player.move(1, 0, xMax, yMax);
    
    socket.emit('player update', {
        x: player.x,
        y: player.y,
        q: player.q,
        score: player.score,
        id: player.id,
        speedX: player.speedX,
        speedY: player.speedY
    });}, 1000); 
*/