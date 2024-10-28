'use strict';
const { v4: uuidv4 } = require('uuid');
const myDB = require('./connection');
const { ObjectID } = require('mongodb');
var fs = require('fs');
module.exports = function (app) {
  
  app.route('/api/threads/:board')
        .post((req, res) => {
			/*
			5. You can send a POST request to /api/threads/{board} with form data including text and delete_password. The saved database record will have at least the fields _id, text, created_on(date & time), bumped_on(date & time, starts same as created_on), reported (boolean), delete_password, & replies (array).
			*/
			//json zusammenstellen
			// text und delete_password aus form holen
			//console.log(req);
			
			let _board = req.body.board || req.params.board;
			if (_board == undefined || _board == null || _board == "" ) { res.end("board null"); return; /*_board = "general";*/}
			let _text = req.body.text;
			let _delete_password = req.body.delete_password;
			let c = Math.floor(Math.random()*10000);
	        fs.appendFile('mynewfile3.txt', "entr:"+c+"Text:"+_text+" - type "+ (typeof _text) + "- pw: "+_delete_password+"- type "+ (typeof _delete_password) + "- board: "+_board+"- type "+ (typeof _board)+ "\n", function (err) {
                if (err) throw err;
                    console.log('Replaced!');
					
            }); 
			// input bereinigen ...
			//id generieren
			let u_id = uuidv4();
			let time = new Date();
			let created_on = time.toISOString();
			let bumped_on = created_on; //time.toISOString();
			let reported = false;
			let replies = [];
			//Datenbankverbindung aufbauen und message finden
			try {
          	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
		        const message_exists = await myDataBase.findOne({ text: _text });
			    //if (message_exists) {
                // Thread ist schon vorhanden
                //console.log("Thread schon vorhanden", message_exists._id);
                //return res.json({ text: message_exists.text, delete_password: message_exists.delete_password, _id: message_exists._id });
		        // macht ja kein sinn, wen
			    //u_id = uuidv4();
		        //}
		        try {
		            const insert_operation = await myDataBase.insertOne({
                    board: encodeURIComponent(_board),
                      text: _text,
                      delete_password: _delete_password,
                      _id: u_id,
		          created_on: created_on,
		          bumped_on: bumped_on,
		          reported: reported,
		          replycount: 0,
		          replies: []
                });
			
		if (insert_operation.insertedId == null || insert_operation.insertedId == "") {
			  console.error("Fehler beim Einfügen in DB", err);
			  res.json({ error: "Fehler beim Einfügen in die Datenbank" });
			  //res.redirect('/b/'+encodeURIComponent(_board));
            } else {
              // Erfolgreich eingefügt
				//return res.json({ text: _text, _id: u_id });
				let res_obj = {
                board: encodeURIComponent(_board),
                text: _text,
                delete_password: _delete_password,
                _id: u_id,
		        created_on: created_on,
		        bumped_on: bumped_on,
		        reported: reported,
		        replies: []
                }
	        fs.appendFile('mynewfile3.txt', "entr: "+c+"  Text:"+_text+" - type "+ (typeof _text) + " - pw: "+_delete_password+"- type "+ (typeof _delete_password) +"    obj:" +JSON.stringify(res_obj)+ " \n\n", function (err) {
                if (err) throw err;
                    console.log('Replaced!');
					
            }); 
			    console.log("inserted:", res_obj);
				res.json(res_obj);
              //res.redirect('/b/'+encodeURIComponent(_board)); 
			}
			
			
			return //res.redirect('/b/'+encodeURIComponent(_board));
            } catch (e) {
		        console.error("Insert Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: u_id});
	        } 
		        });	
            } catch (e) {
		        console.error("Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: u_id});
	        }
		})
		.get((req, res) => {
			//letzten 10 Einträge
			//console.log(req);
			let board_ = req.body.board || req.params.board;
				console.log("wegftwegwsegwegwegweegwegwgwegwsegwegwgwgwgwg", req.params.board, board_);
			if (board_ == null || board_ == undefined ||board_ == 'undefined') {
				board_ = req.params.board;
				console.log("wegftwegwsegwegwegweegwegwgwegwsegwegwgwgwgwg", board_);
			}
			board_ = encodeURIComponent(board_);
			console.log("GET ANFANG");
	        let c = Math.floor(Math.random()*10000);
			fs.appendFile('mynewfile3.txt', "entr: "+c+" GET ANFANG - board: "+_board+"- type "+ (typeof _board)+ "\n", function (err) {
                if (err) throw err;
                    console.log('Replaced!');
					
            }); 
			console.log(board_);
			try {
          	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
		        let messages_exists = await myDataBase.find({ board: board_ }).sort({ created_on:-1}).limit(10).toArray();//({ _id: t_id }); //finde Nachricht mit sort nach created_on --> -1 meint absteigend, 1 meint aufsteigend, limit limitiert die Suche
		        let to_send = [];
				console.log("messages_exists", messages_exists, board_);
				let len = messages_exists.length;
				for (let i = 0; i < len; i++) {
					//let board = encodeURIComponent(messages_exists.board);
					console.log("gleich?", messages_exists[i].board, board_);
					//if ( messages_exists[i].board == board_ && messages_exists[i].board != undefined && messages_exists[i].board != 'undefined' ) {
                    messages_exists[i].replies = messages_exists[i].replies.filter((ele) => ele._id != '[deleted]').sort((a, b) => Date.parse(a.created_on) - Date.parse(b.created_on)).slice(0,3);
					to_send.push({ text: messages_exists[i].text , _id: messages_exists[i]._id , created_on: messages_exists[i].created_on , replies: messages_exists[i].replies, replycount: messages_exists[i].replycount /*, board: messages_exists[i].board*/ });
				    //}
				}
				console.log("to send:", to_send);
			    //console.log(board_);
				
				console.log("GET ENDE");
			fs.appendFile('mynewfile3.txt', "entr: "+c+" GET ENDE - board: "+_board+"- type "+ (typeof _board)+ "ausgabe"+to_send+"\n\n", function (err) {
                if (err) throw err;
                    console.log('Replaced!');
					
            }); 
				return res.json(to_send);
				
				}); 	
            } catch (e) {
		        console.error("Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: u_id});
	        }
		})
		.delete(function(req, res){ 
            console.log(req);
            let t_id = req.body.thread_id || req.params.thread_id ;
            let _delete_password = req.body.delete_password || req.params.delete_password ; 
            let _board = req.body.board || req.params.board ; 
			console.log("del", t_id, _delete_password);console.log("ewgwegweghwrehgdefrherghwgrergewg", req.body.delete_password);
			console.log("del", t_id, _delete_password);console.log("ewgwegweghwrehgdefrherghwgrergewg", _board);
            //if successful response will be 'delete successful'
	          try {
	          myDB(async client => {
		        const myDataBase = await client.db('database').collection('messages');
		        const thread_to_delete = await myDataBase.findOne({_id : t_id, board: _board});
				console.log("to delete", thread_to_delete);
		        if (_delete_password != null && _delete_password != "" && _delete_password != undefined && thread_to_delete.delete_password == _delete_password){
				    const thread_deleted = await myDataBase.deleteOne({_id : t_id});
		            if (thread_deleted.deletedCount > 0) {
	 	               res.setHeader('Content-Type', 'text/plain');
	                   return res.end('success');
		            } else {
		                //  res.setHeader('Content-Type', 'text/plain');
	               //return res.end('no book exists');
						console.log("error 98");
						res.redirect('/');
						return;
		        }
				} else {
					res.setHeader('Content-Type', 'text/plain');
	                return res.end('incorrect password');
				}
              });	
            } catch (e) {
		        console.error("Fehler:", e);
		        return res.json({error: "keine Datenbankverbindung"});
	        } finally {
		// Verbindung schließen
			//await client.close();
		}
    })
        .put(function(req, res){
            let t_id = req.body.thread_id;
            //if successful response will be '[reported]'
	          try {
	            myDB(async client => {
		        const myDataBase = await client.db('database').collection('messages');
		        const entry_update = await myDataBase.updateOne({_id : t_id}, {$set: {reported : true } } );
                    
                // Ergebnis prüfen
                if (entry_update.matchedCount > 0) {
                    console.log(`Erfolgreich aktualisiert: ${entry_update.modifiedCount} Dokument(e)`);
                    const res_update = await myDataBase.findOne({_id : t_id});
		                console.log({ _id: res_update._id, text:  res_update.text, replies: res_update.replies, reported: res_update.reported });
		                res.setHeader('Content-Type', 'text/plain');
                        res.end('reported');
                	    return;
					} else {
		                console.log("Kein Dokument gefunden, das dem Filter entspricht.");
	                    console.log("error 132");
						res.redirect('/');
						return;
	                }
		                return;
                    });	
                        } catch (e) {
                            console.error("Fehler:", e);
                            return res.json({error: "keine Datenbankverbindung"});
                        } finally {
		// Verbindung schließen
			//await client.close();
		                }
					});
    
  app.route('/api/replies/:board').post((req, res) => { //HTTP POST localhost:3000/api/relies/*board*
			//reply in thread einbauen
			//json zusammenstellen
			// text und delete_password aus form holen
			let _board = req.body.board || req.params.board;
			//console.log("ewgwegweghwrehgdefrherghwgrergewg", _board);
			let _text = req.body.text;
			let _delete_password = req.body.delete_password;
			// input bereinigen ...
			//id generieren
			let t_id = req.body.thread_id || req.params.thread_id;
			let time = new Date();
			let bumped_on_update = time.toISOString();
			let created_on_message = bumped_on_update;
			
			
			//Datenbankverbindung aufbauen und message finden
			try {
          	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
		        const message_exists = await myDataBase.findOne({ _id: t_id }); //finde Nachricht mit thread_id
			    if (message_exists) {
			// Thread ist vorhanden
		    //console.log("Thread vorhanden", message_exists._id);
			//return res.json({ text: message_exists.text, delete_password: message_exists.delete_password, _id: message_exists._id });
		    // macht ja kein sinn, wen
			let u_id = uuidv4();
		    //let rep = message_exists.replies;
				//rep.push({ _id: u_id , text: _text , created_on : created_on_message, delete_password : _delete_password, reported : false});
		// Dokument aktualisieren  , bumped_on : bumped_on_update
		// $push um reply in Array hinzuzufügen, $inc um replycount zu erhöhen
		const entry_found = await myDataBase.updateOne(
		            {_id : message_exists._id}, 
					{$push: {
						replies : { _id: u_id , 
					    text: _text , 
						created_on : created_on_message, 
						delete_password : _delete_password, 
						reported : false} }, 
					$inc: {replycount: 1},
					$set: {bumped_on : bumped_on_update }  
					} );
		
		//console.log("thread update:", message_exists);
		// Ergebnis prüfen
		if (entry_found.matchedCount > 0) {
			console.log(`Erfolgreich aktualisiert: ${entry_found.modifiedCount} Dokument(e)`);
			//bumped_on aktualisieren 
		    //const entry_found1 = await myDataBase.updateOne({_id : message_exists._id}, {$set: {bumped_on : bumped_on_update } } );
			
			const res_update = await myDataBase.findOne({_id : t_id});
			let erg_json = { _id: res_update._id, board:  res_update.board, text:  res_update.text, replies:  res_update.replies, created_on: res_update.created_on, bumped_on: res_update.bumped_on };
			console.log("inserted 224:", erg_json);
			res.json(erg_json);//.redirect('/b/'+encodeURIComponent(_board));
		} else {
			console.log("Kein Dokument gefunden, das dem Filter entspricht.");
	 	    res.setHeader('Content-Type', 'text/plain');
	        res.end('no entry exists');
		}
		//res.redirect('/b/'+ encodeURIComponent(_board)+'/'+t_id);
		return;
		/*
		    const insert_operation = await myDataBase.insertOne({
                text: message_exists.text,
                delete_password: message_exists.delete_password,
                _id: message_exists._id,
		        created_on: message_exists.created_on,
		        bumped_on: bumped_on_update,
		        reported: message_exists.reported,
		        replies: rep
            });
				
		if (insert_operation.insertedId == null || insert_operation.insertedId == "") {
			  console.log("Fehler beim Einfügen in DB", err);
			  return res.json({ error: "Fehler beim Einfügen in die Datenbank" });
              //res.redirect('/');
            } else {
              // Erfolgreich eingefügt
				return res.json({ text: _text, _id: u_id });
			}*/
				}
		        }); 	
            } catch (e) {
		        console.error("Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: u_id});
	        }
		})
		.get((req, res) => {
			//console.log(req);
			let t_id = req.query.thread_id;
			let board = req.params.board;
			try {
          	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
		        //const message_exists = await myDataBase.findOne({ _id: t_id }); //finde Nachricht mit thread_id
		        const message_exists = await myDataBase.findOne({$or: [{ _id: t_id }, { board: board }]}); //finde Nachricht mit thread_id oder board
			    if (message_exists) {
					return res.json({ text: message_exists.text , _id: message_exists._id , created_on: message_exists.created_on , bumped_on: message_exists.bumped_on, replies: message_exists.replies, board: message_exists.board});
				
				}
				console.log("GET REPLY does not function 272", t_id, message_exists );
		        }); 	
            } catch (e) {
		        console.error("Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: u_id});
	        }
		}) 
        .delete(function(req, res){
            let t_id = req.body.thread_id || req.params.thread_id;
            let rep_id = req.body.reply_id || req.params.reply_id;
            let _delete_password = req.body.delete_password|| req.params.delete_password;
            //if successful response will be '[delete]'
	          try {
	          myDB(async client => {
		        const myDataBase = await client.db('database').collection('messages');
				//thread finden
		        const thread_to_exist = await myDataBase.findOne({_id : t_id});
				console.log("REPLIES FROM THREAD IN QUESTION eopswitgfjwesopgkwsoegkowesgoke", thread_to_exist);
					let len = thread_to_exist.replies.length;
					for(let i = 0; i < len; i++) {
						if(thread_to_exist.replies[i]._id == rep_id){
							console.log("warum funktooniert das nicht????ewtgwetgewtgewewrgeg", thread_to_exist.replies[i].delete_password, _delete_password)
                              if (thread_to_exist.replies[i].delete_password == _delete_password){
					              thread_to_exist.replies[i]._id = "[deleted]";
				               } else {
						         res.setHeader('Content-Type', 'text/plain');
	                             return res.end('incorrect password');
		                       }
					        }
				         }
			         
					
					//reply auf [deleted] setzen und replycount dekrementieren
                    const entry_update = await myDataBase.updateOne({_id : t_id}, {$set: {replies : thread_to_exist.replies } /*,  $inc: {replycount : -1} */ } );
                    
                // Ergebnis prüfen
                if (entry_update.matchedCount > 0) {
                    console.log(`Erfolgreich aktualisiert: ${entry_update.modifiedCount} Dokument(e)`);
                    const res_update = await myDataBase.findOne({_id : t_id});
		                console.log({ _id: res_update._id, text:  res_update.text, replies: res_update.replies, created_on: res_update.created_on });
		                res.setHeader('Content-Type', 'text/plain');
                        res.end('success');
                	} else {
		                console.log("Kein Dokument gefunden, das dem Filter entspricht.");
	                     res.setHeader('Content-Type', 'text/plain');
                       res.end('no entry exists');
	                }
		                return;
                              });	
                            } catch (e) {
                                        console.error("Fehler:", e);
                        return res.json({error: "keine Datenbankverbindung"});
                        } finally {
		// Verbindung schließen
			//await client.close();
		            }
		        })
				.put(function(req, res){
                    let t_id = req.body.thread_id;
                    let rep_id = req.body.reply_id;
                    //if successful response will be 'success'
	                try {
	                myDB(async client => {
		                const myDataBase = await client.db('database').collection('messages');
		                const thread_to_exist = await myDataBase.findOne({_id : t_id});
		                let len = thread_to_exist.replies.length;
					    for(let i = 0; i < len; i++) {
				            if(thread_to_exist.replies._id == rep_id){
			                    thread_to_exist.replies.reported = true;
			    			    }
			    			}
                        const entry_update = await myDataBase.updateOne({_id : t_id}, {$set: {replies : thread_to_exist.replies } } );
                    
                // Ergebnis prüfen
                    if (entry_update.matchedCount > 0) {
                        console.log(`Erfolgreich aktualisiert: ${entry_update.modifiedCount} Dokument(e)`);
                        const res_update = await myDataBase.findOne({_id : t_id});
		                console.log({ _id: res_update._id, text:  res_update.text, replies: res_update.replies, created_on: res_update.created_on });
		                res.setHeader('Content-Type', 'text/plain');
                        res.end('reported');
                	} else {
		                console.log("Kein Dokument gefunden, das dem Filter entspricht.");
	                    res.setHeader('Content-Type', 'text/plain');
                        res.end('no entry exists');
	                }
		            return;
						});	
                         } catch (e) {
                                        console.error("Fehler:", e);
                        return res.json({error: "keine Datenbankverbindung"});
                        } finally {
		// Verbindung schließen
			//await client.close();
		            }
		        });

};
