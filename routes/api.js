'use strict';
const { v4: uuidv4 } = require('uuid');
const myDB = require('./connection');
const { ObjectId } = require('mongodb');
var fs = require('fs');
const bcrypt = require('bcrypt');
module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post((req, res) => {
        myDB(async client => {
	  try {
        const myDataBase = await client.db('database').collection('messages');
        let board = req.params.board;
        console.log('post /api/threads/:board', board, req.body.text, req.body.delete_password);
        let newThread = {
            board: board,
            text: req.body.text,
            created_on: new Date(),
            bumped_on: new Date(),
            reported: false,
            delete_password: req.body.delete_password,
            replies: [],//      
	        replycount: 0
        };
        const insert_operation = await myDataBase.insertOne(newThread);
        return res.redirect("/b/" + board);
      } catch (err) {
        console.error("Fehler beim Einfügen der Threads:", err);
        return res.json("error");
       }
   });
    })
	.get((req, res) => {
        myDB(async client => {
		  try {
        const myDataBase = await client.db('database').collection('messages');
            let board = req.params.board || req.query.board || req.body.board; // Ich weiß nie, wann diese parameter übergeben werden, hoffe das reich
        console.log('get /api/threads/:board', board);
        let threadArray = await myDataBase.find({ board : board })
              .sort({ bumped_on: -1 }) 
              .limit(10)
              .toArray();
		//console.log(threadArray);
        threadArray = threadArray.map(ele => {
            // `replycount` hinzufügen
            ele.replycount = ele.replies ? ele.replies.length : 0;
            // `replies` auf die letzten 3 Antworten beschränken und sortieren
            if (ele.replies) {
                ele.replies = ele.replies
                   .sort((a, b) => Date.parse(b.created_on) - Date.parse(a.created_on))
                   .slice(0, 3) // Limitierung auf 3
                   .map(reply => ({
                        _id: reply._id,
                        text: reply.text,
                        created_on: reply.created_on
                    })); // `delete_password` und `reported` entfernt
                }
                // Rückgabe nur den geforderten Feldern
              return {
                _id: ele._id,
                text: ele.text,
                board: ele.board,
                created_on: ele.created_on,
                bumped_on: ele.bumped_on,
                replies: ele.replies,
                replycount: ele.replycount
              };
            });
		//console.log("output GET THREADS: ", threadArray);
        return res.json(threadArray);
  } catch (err) {
    console.error("Fehler beim Abrufen der Threads:", err);
    return res.json("error");
  }
   });
})
	.delete(function(req, res){
        myDB(async client => {
        try {
            const myDataBase = await client.db('database').collection('messages');
            let board = req.params.board;
            console.log('delete /api/threads/:board', board, req.body.thread_id, req.body.delete_password);
            let deletedThread = await myDataBase.findOne({ _id: new ObjectId(req.body.thread_id) } );
	        //console.log(deletedThread
            res.setHeader('Content-Type', 'text/plain');
            if (req.body.delete_password === deletedThread.delete_password) {
              await myDataBase.deleteOne({ _id: deletedThread._id });
              return res.send("success");
            } else {
              return res.send("incorrect password");
            }
        } catch (err) {
            console.error("Fehler beim Löschen des Threads:", err);
            res.json("error");
          }
      });
})
    .put(function(req, res){
      myDB(async client => {
        try {
          console.log('put /api/threads/:board', req.params.board, req.body.thread_id);
          const myDataBase = await client.db('database').collection('messages'); 
          let updateThread = await myDataBase.updateOne({ _id: new ObjectId(req.body.thread_id) }, // Filter
             { $set: { "newThread.reported": true } } );// Update    
          res.setHeader('Content-Type', 'text/plain');
          return res.send("reported");
    } catch (err) {
        console.error("Fehler beim Aktualisieren des Threads:", err);
        res.json("error");
    }
  })
});

   app.route('/api/replies/:board').post((req, res) => {
     myDB(async client => {
    try {
        const myDataBase = await client.db('database').collection('messages');
        let board = req.params.board;
        let thread_id = req.query.thread_id || req.params.thread_id || req.body.thread_id;
        console.log('post /api/replies/:board', board, thread_id, req.body.delete_password);
	   // Aktualisiere das `bumped_on`-Feld und füge die neue Antwort hinzu
       await myDataBase.updateOne(
            { _id: new ObjectId(thread_id) }, // Filter
              {
                $set: { "bumped_on": new Date().toUTCString()/*.toISOString()*/ }, // Setzt `bumped_on`
                $push: { // Fügt eine neue Antwort zum `replies`-Array hinzu
                      "replies": {
                            _id: uuidv4(),
                            text: req.body.text,
                            created_on: new Date().toUTCString(),
                            delete_password: req.body.delete_password,
                            reported: false,
                          },
                    },
                $inc: { replycount: 1}
                  }
        );
        return res.redirect("/b/" + board + "/" + req.body.thread_id);
    } catch (err) {
        console.error("Fehler beim Einfügen der Antwort:", err);
        res.json("error");
    }
  })
})
  .get((req, res) => {
      myDB(async client => {
        try {
        const myDataBase = await client.db('database').collection('messages');
        let board = req.query.board || req.params.board || req.body.board;
	    let thread_id = req.query.thread_id || req.params.thread_id || req.body.thread_id;
        console.log('get /api/replies/:board', board, thread_id);
	    if (!ObjectId.isValid(thread_id)) {
	        return res.status(400).send("Ungültige thread_id");
	    }
        let thread = await myDataBase.findOne({ _id: new ObjectId(thread_id) });
        if (thread) {
          // Setze `delete_password` und `reported` auf undefined
          thread.delete_password = undefined;
          thread.reported = undefined;
          thread.replycount = thread.replies.length;

          /* Setze `delete_password` und `reported` für jede Antwort auf undefined*/
          thread.replies.forEach(reply => {
            reply.delete_password = undefined;
            reply.reported = undefined;
          });
        // Sende die bearbeitete `thread`-Datenstruktur als Antwort
        return res.json(thread);
	    }
	  return res.status(404).send("Thread not found");
    } catch (err) {
        console.error("Fehler beim Abrufen der Threads:", err);
        res.json("error");
      }
    });
  }) 
    .delete(function(req, res){
        myDB(async (client) => {
      try {
        const myDataBase = client.db("database").collection("messages");
	    let thread_id = req.query.thread_id || req.params.thread_id || req.body.thread_id;
        console.log('delete /api/replies/:board', req.params.board, thread_id, req.body.reply_id, req.body.delete_password);
        // Suche den Thread anhand der thread_id
        let foundThread = await myDataBase.findOne({ _id: new ObjectId(thread_id) });

        res.setHeader('Content-Type', 'text/plain');
        if (foundThread) {
          //let replyUpdated = false; // wurde  eine Antwort aktualisiert ?

          for (const ele of foundThread.replies) {
            if (ele._id == req.body.reply_id &&
              ele.delete_password == req.body.delete_password) {
          // delte durch Setzen des Textes der Antwort auf "[deleted]"
          ele.text = "[deleted]";
          //replyUpdated = true; 

          // Aktualisieren der Datenbank
          await myDataBase.updateOne(
            { _id: new ObjectId(thread_id) },
            { $set: { "replies": foundThread.replies } } // Setze die aktualisierten Antworten
          );

          return res.send("success"); // Erfolgsnachricht zurückgeben
        } else if (
          ele._id == req.body.reply_id &&
          ele.delete_password != req.body.delete_password
        ) {
          return res.send("incorrect password"); // Falsches Passwort
        }
      }

      // Wenn keine passende Antwort gefunden wurde, kann hier eine Nachricht gesendet werden
      return res.send("reply not found");
    } else {
      return res.send("thread not found"); // Wenn der Thread nicht gefunden wird
    }
  } catch (err) {
    console.error("Fehler beim Löschen der Antwort:", err);
    res.json("error");
  }
});
})
  .put(function(req, res){
      myDB(async (client) => {
        try {
            const myDataBase = client.db("database").collection("messages");
            let thread_id = req.query.thread_id || req.body.thread_id || req.params.thread_id;
            let reply_id = req.query.reply_id || req.body.reply_id || req.params.reply_id;
            console.log('put /api/replies/:board', thread_id, reply_id);
            // Suche den Thread anhand der thread_id
            let foundThread = await myDataBase.findOne({ _id: new ObjectId(thread_id) });
            res.setHeader('Content-Type', 'text/plain');
            if (foundThread) {
          // Durchlaufe aller Antworten im Thread
          for (const ele of foundThread.replies) {
            if (ele._id == reply_id) {
              ele.reported = true;
              // Aktualisieren des Threads in der Datenbank
              await myDataBase.updateOne(
                { _id: new ObjectId(thread_id) },
                { $set: { "replies": foundThread.replies } } // Setze die aktualisierten Antworten
              );
          // Erfolgsnachricht zurückgeben
          return res.send("reported");
         }
        }
        // Wenn die Antwort nicht gefunden 
        return res.send("reply not found");
     } else {
        return res.send("thread not found"); // Wenn der Thread nicht gefunden wird
     }
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Threads:", err);
      res.json("error");
   }
  });
  });
  
};
