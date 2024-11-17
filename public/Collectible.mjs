class Collectible {
  constructor({ x = 10, y = 10, q = 15, id = Math.floor(Math.random()*1000)}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.q = q;
	this.q_rand = q/2;
  }

  
draw() {
    let squareX = this.x, squareY = this.y, squareSize = this.q;
	let context = canvas.getContext('2d');

    context.fillStyle = '#dfac20';
    context.fillRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);
    context.lineWidth = 3;
    context.strokeStyle = '#39F3ab';
    context.strokeRect(squareX - ( squareX % 10), squareY - ( squareY % 10), squareSize, squareSize);	
  }
  
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
