'use strict';
var fs = require('fs');
const bcrypt = require('bcrypt');
const hash = require('crypto').createHash;

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res){
      
	let symbols = req.query.stock;
	console.log(symbols);
	let gefunden;
	let stocks_obj = {};
	stocks_obj = JSON.parse(fs.readFileSync('stocks.json', 'utf-8') || '[]');
	console.log("stocks:", stocks_obj);
	console.log("typeof symbols:", typeof symbols);
	if (typeof symbols == "string"){
	//console.log("stocks:", stocks_obj[1].likes);
	for(let i = 0; i < stocks_obj.length; i++){
		if(stocks_obj[i].stock.toUpperCase() == symbols.toUpperCase()){
			gefunden = i;
			console.log("i:", i);
			break;
			}
		}
		let likes1 = stocks_obj[gefunden].likes;
		let price1 = stocks_obj[gefunden].price;
		//let likes1 = stocks_obj.likes;
	console.log(req.query.like, typeof req.query.like);
	
	if(req.query.like == "true"){
		console.log("im here")
		console.log(req.rawHeaders[1]);
		//ip hash berechnen
		//bcrypt.hash(req.rawHeaders[1], 10, (err, hash) => {
			//if (err)  {console.error("Fehler IP Hash: ",err) }
		//mit json abgleichen
		let ip_hash;
		let gefunden = -1;
		//fs.readFile('ip_hash.json', function(err, data) {
		//if (err) {console.error("Fehler Datei lesen: ",err) }
		let ip_obj = {};
		ip_obj = JSON.parse(fs.readFileSync('stocks.json', 'utf-8') || '');
		let salt = "nan-secret";
		ip_hash = hash('md5').update(salt + req.rawHeaders[1]).digest('hex');
		for(let i = 0; i < ip_obj.length; i++){
			if(ip_obj[i].ip == ip_hash){
				gefunden = i;
				break;
			}
		}
		console.log("gefunden", gefunden)
			
		if(gefunden < 0 /*&& ip_obj[gefunden].stock.toUpperCase() != symbols.toUpperCase()*/ ) {
			console.log("hier weiter", likes1);
			// wenn nicht gefunden, like ++
			likes1++;
			console.log("lieks", likes1);
			//stocks_obj[gefunden].likes = likes1;
			let like_ip_obj = {stockname : symbols, ip : ip_hash};
			ip_obj.push(like_ip_obj);
			
			//fs.writeFileSync(jsonFilePath, JSON.stringify(issues, null, 2)); // Speichern mit 2er Einrückung für bessere Lesbarkeit
			fs.writeFile('ip_hash.json', JSON.stringify(ip_obj) , function (err) { if (err) throw err;
				console.log('Replaced!');
			});
            fs.writeFile('stocks.json', JSON.stringify(stocks_obj) , function (err) { if (err) throw err;
				console.log('Replaced!');
			}); 			
		}
		//});
		//});
	}
	
			return res.json({stockData : {stock: symbols.toUpperCase(), price : price1, likes: likes1} }  ); 	
		
	} else {
			console.log("2 stocks")
		if (symbols.length > 1){
			console.log("2 stocks")
			//suche
			stocks_obj = {};
			stocks_obj = JSON.parse(fs.readFileSync('stocks.json', 'utf-8') || '[]');
	
			/*fs.readFile('stocks.json', function(err, data) {
				if (err) {console.error("Fehler Datei lesen: ",err) }
				let stocks_obj = JSON.parse(data);
			});*/
		let gefunden1 = -1, gefunden2 = -1;
		
		for(let i = 0; i < stocks_obj.length; i++){
			if(stocks_obj[i].stock.toUpperCase() == symbols[0].toUpperCase()){
				gefunden1 = i;
				
			}
			if(stocks_obj[i].stock.toUpperCase() == symbols[1].toUpperCase()){
				gefunden2 = i;
				
			}
		}
		if (gefunden1 >= 0 && gefunden2 >= 0) {
		let likes1 = stocks_obj[gefunden1].likes;
		let price1 = stocks_obj[gefunden1].price;
		let likes2 = stocks_obj[gefunden2].likes;
		let price2 = stocks_obj[gefunden2].price;
		//let likes1 = stocks_obj.likes;
	
			
			let len = symbols.length;
			/*for(let i = 0; i < len; i++) {
				if (symbols[i] == "goog"){ symbols[i].toUpperCase();}
			}*/
			return res.json({stockData : [{stock: symbols[0].toUpperCase(), price : price1, likes: likes1, rel_likes: (price1 - price2)}, {stock: symbols[1].toUpperCase(), price : price2, likes: likes2, rel_likes: (price2 - price1)}] }  );
		}
		else {
			return res.json({stockData : {error: "invalid symbols"} }  );
			
		}
		}
			return res.json({stockData : {error: "invalid symbols"} }  );
			
		
	}
	
	});
    
};
