//import { canvasCalcs } from './canvas-data.mjs';

class Player {
  constructor({id = 1, x = 10, y = 10, q = 30, score = 0 /*, main, id*/, speedX, speedY, colour = '#dfac20' }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.q = q; //Größe
    this.speedY = speedY;
    this.speedX = speedX;
    this.score = score;
    this.colour = colour;
	//this.id = id;
    //this.movementDirection = {};
    //this.isMain = main;
	

    document.addEventListener("keydown", (event) => this.onKeydown(event));

  }

//Kollisionsabfrage
collision(item) {
 return (
        this.x < item.x + item.q &&       // Rechte Kante von Player überlappt linke Kante von item
        this.x + this.q > item.x &&       // Linke Kante von Player überlappt rechte Kante von item
        this.y < item.y + item.q &&       // Untere Kante von Player überlappt obere Kante von item
        this.y + this.q > item.y          // Obere Kante von Player überlappt untere Kante von item
    );
	}
/*
x,y      x+q,y 
	------
	|item|
	|    |
	------
x,y+q    x+q,y+q 

Es gibt vier Fälle: player überlappt links und oben ( aber ins item hinein)
	------
	|play|
	|  --|---
	---|--  |
       |item|
	   ------
*/
/*
    if ((this.x +this.q > item.x && this.y +this.q > item.y ) && (this.x < item.x && this.y < item.y) ) {
	console.log("überlapp oben links ", this.x, this.y, this.q, item.x, item.y, item.q );
	return true;
	}
	/*
	player überlappt rechts und oben ( aber ins item hinein)
	      ------
	      |play|
	   ---|--  |
	   |  --|---
       |item|
	   ------
    */
	/*
    if ((this.x + this.q > item.x + item.q && this.y < item.y ) && (this.x < item.x + item.q && this.y + this.q > item.y) ) {
	console.log("überlapp oben rechts ", this.x, this.y, this.q, item.x, item.y, item.q );
	return true;
	}*/
	/*
	player überlappt links und unten ( aber ins item hinein)
	       ------
	       |item|
	    ---|--  |
	    |  --|---
        |play|
	    ------
    */
	/*
    if ((this.x + this.q > item.x && this.y < item.y + item.q ) && (this.x < item.x + item.q && this.y + this.q > item.y + item.q) ) {
	console.log("überlapp links unten ", this.x, this.y, this.q, item.x, item.y, item.q );
	return true;
	}*/
	/*
	player überlappt rechts und unten ( aber ins item hinein)
	------
	|item|
	|  --|---
	---|--  |
       |play|
	   ------
    */
    /*
    if ((this.x > item.x && this.y > item.y ) && (this.x + this.q > item.x + item.q && this.y + this.q > item.y) ) {
	console.log("überlapp rechts unten ", this.x, this.y, this.q, item.x, item.y, item.q );
	return true;
	}
}*/

draw() {
    let squareX = this.x, squareY = this.y, squareSize = this.q;
	let context = canvas.getContext('2d');

    context.fillStyle = this.colour;
    context.fillRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);
    context.lineWidth = 3;
    context.strokeStyle = '#39F3ab';
    context.strokeRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);	
  }
  
  reverse(mirror, dir) {
    if(dir == 'X'){
     this.x = 2*mirror - this.x;
     this.speedX = -this.speedX;
	 }
	if(dir == 'Y'){
     this.y = 2*mirror - this.y;
     this.speedY = -this.speedY;
	 }
	 return;
  }
  
  move(timestamp, lastTimestamp, xMax, yMax) {
       //console.log(this.x, this.y);
	   let delta_x = (timestamp - lastTimestamp ) * this.speedX;
       let delta_y = (timestamp - lastTimestamp ) * this.speedY;
       this.x += delta_x;
       this.y += delta_y;
       // Gültigen X-Bereich verlassen? Wenden
       let x = this.x; 
	   let y = this.y;
	   let q = this.q;
	   if(x <= 0) {
          this.reverse(0, "X");
       }
       if (x >= xMax - q/2) {
          this.reverse(xMax - q/2, "X");
       }
	   // Gültigen y-Bereich verlassen? Wenden
       if(y <= 0) {
          this.reverse(0, "Y");
       }
       if (y >= yMax - q/2 ) {
          this.reverse(yMax - q/2 , "Y");
       }
	   
	}
  
  
  
onKeydown = (event) => {
//alert(event.code);
console.log(event.code);
	if(event.code == "KeyW") {
		if(this.speedY > 0){this.speedY = -this.speedY;}
	}
	if(event.code == "KeyS") {
		if(this.speedY < 0){this.speedY = -this.speedY;}

}
	if(event.code == "KeyD") {
		if(this.speedX < 0){this.speedX = -this.speedX;}
}
	if(event.code == "KeyA") {
		if(this.speedX > 0){this.speedX = -this.speedX;}
}
};
  
}

export default Player;