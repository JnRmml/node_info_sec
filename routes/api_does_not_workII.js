'use strict';
const { v4: uuidv4 } = require('uuid');
const myDB = require('./connection');
const { ObjectID } = require('mongodb');
var fs = require('fs');
const bcrypt = require('bcrypt');
module.exports = function (app) {
  
  app.route('/api/threads/:board')
        .post((req, res) => {
			/*
			5. You can send a POST request to /api/threads/{board} with form data including text and delete_password. The saved database record will have at least the fields _id, text, created_on(date & time), bumped_on(date & time, starts same as created_on), reported (boolean), delete_password, & replies (array).
			*/
			//json zusammenstellen
			// text und delete_password aus form holen
			//console.log(req);
      try {
		    	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
			const boardName = req.params.board;
            const { text, delete_password } = req.body;
            const date = new Date();
            const hashedPassword = await bcrypt.hash(delete_password, 10);
			let unique_id = uuidv4();

        //let board = await Boards.findOne({ name: boardName }).exec();

        /*if (!board) {
          board = new Boards({
            name: boardName,
            threads: [],
          });
        }*/

        const newThread = {
			_id: unique_id,
            board: boardName,
          text: text,
          created_on: date,
          bumped_on: date,
          reported: false,
          delete_password: hashedPassword,
          replycount: 0,
          replies: [],
        };
        
        try {
            const insert_operation = await myDataBase.insertOne({newThread});
			if (insert_operation.insertedId == null || insert_operation.insertedId == "") {
			    console.error("Fehler beim Einfügen in DB", err);
			    res.json({ error: "Fehler beim Einfügen in die Datenbank" });
			    //res.redirect('/b/'+encodeURIComponent(_board));
                }
                //board.threads.push(newThread);
                //await board.save();
                res.json(newThread);
            } catch (e) {
		        console.error("Insert Fehler:", e);
        		return res.json({error: "keine Datenbankverbindung", text: _text, _id: unique_id});
	        } 
	        } );
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to save the thread.' });
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
			fs.appendFile('mynewfile3.txt', "entr: "+c+" GET ANFANG - board: "+board_+"- type "+ (typeof board_)+ "\n", function (err) {
                if (err) throw err;
                    console.log('Replaced!');
					
            }); 
			console.log(board_);
			try {
          	    myDB(async client => {
        		const myDataBase = await client.db('database').collection('messages');
			    console.log("board_:", board_);
		        let messages_exists = await myDataBase.find({ "newThread.board": board_ }).sort({ "newThread.bumped_on" : -1}).limit(10).toArray();//({ _id: t_id }); //finde Nachricht mit sort nach created_on --> -1 meint absteigend, 1 meint aufsteigend, limit limitiert die SuchenewThread
				console.log("messages_exists", messages_exists);
                console.log("Länge von messages_exists:", messages_exists.length);
		        let to_send = [];
				//console.log("messages_exists", messages_exists, board_);
				let len = messages_exists.length;
				if (messages_exists.length > 0) {
				for (let i = 0; i < len; i++) {
					//let board = encodeURIComponent(messages_exists.board);
					console.log("gleich?", messages_exists[i].newThread.board, board_, messages_exists[i].newThread.replies);
					//if ( messages_exists[i].board == board_ && messages_exists[i].board != undefined && messages_exists[i].board != 'undefined' ) { .filter((ele) => ele._id != '[deleted]')
                    messages_exists[i].replies = messages_exists[i].newThread.replies.sort((a, b) => Date.parse(a.created_on) - Date.parse(b.created_on)).slice(0,3);
					to_send.push({ 
					text: messages_exists[i].newThread.text , 
					_id: messages_exists[i].newThread._id , 
					created_on: messages_exists[i].newThread.created_on , 
					replies: messages_exists[i].newThread.replies, 
					replycount: messages_exists[i].newThread.replycount /*, board: messages_exists[i].board*/ 
					});
				    //}
				}
				}
				console.log("to send:", to_send);
			    //console.log(board_);
				
				console.log("GET ENDE");
			fs.appendFile('mynewfile3.txt', "entr: "+c+" GET ENDE - board: "+board_+"- type "+ (typeof board_)+ "  ts ausgabe"+to_send+"\n\n", function (err) {
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
		        //const message_exists = await myDataBase.findOne({$or: [{ _id: t_id }, { board: board }]}); //finde Nachricht mit thread_id oder board
				let message_exists
				try {
		            message_exists = await myDataBase.findOne({ _id: t_id }); //finde Nachricht mit thread_id oder board
				    console.log("warum findest du das nicht?", message_exists);
                 //message_exists = await myDataBase.findOne({ _id: ObjectId(t_id) });
                 } catch (error) {
                      console.log("Error converting t_id to ObjectId:", error);
                 }
			    if (message_exists) {
					return res.json({ text: message_exists.text , _id: message_exists._id , created_on: message_exists.created_on , bumped_on: message_exists.bumped_on, replies: message_exists.replies, board: message_exists.board});
				
                }
                console.log("GET REPLY does not function 291", t_id, message_exists );
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
