const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { v4: uuidv4 } = require('uuid');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    // Test 1 Creating a new thread: POST request to /api/threads/{board}
    test('Test 1 Creating a new thread: POST request to /api/threads/tests', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/threads/tests')
		.send({
			"text": "thread_text No.1",
			"delete_password": "Musterpw"
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
	
	
	let u_id = uuidv4();
	let pw_ids = [];
    // Before hook to generate 10 stock threads
before('b4 generate 10 stock threads', function(done) {
this.timeout(10000); // Timeout auf 10 Sekunden erhöhen
  let promises = [];
  for (let i = 0; i < 10; i++) {
     pw_ids.unshift("Musterpw"+i);
    promises.push(
      chai
        .request(server)
        .post('/api/threads/tests') 
        .send({
          "text": u_id + " thread_text No." + i,
          "delete_password": "Musterpw" + i,
        })
    );
  }
  // Auf promises resolves warten
  Promise.all(promises)
    .then(responses => {
      responses.forEach((res, index) => {
        assert.equal(res.status, 200, `Thread ${index} was not created`);
      });
      done();
    })
    .catch(err => done(err));  // Handle any errors
});
    // Test 2 Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
	//id speichern für spätere tests
	let ids = [];
	//let pw_ids = [];
    test('Test 2 Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/tests', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/threads/tests')
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'application/json');
		  assert.isArray(res.body, 'should be an Array');
		  assert.isAtMost(res.body.length, 10, 'should have at most 10 Elements');
		  for(let j = 0; j < res.body.length; j++){
              assert.isArray(res.body[j].replies, 'replies should be an array');
			  assert.isAtMost(res.body[j].replies.length, 3, 'replies should have at most 3 Elements');
			  ids.push(res.body[j]._id);
		  }
    console.log(ids);
    console.log(pw_ids);
          done();
        });
    });
	
	
    before('b4 get ids from threads', function(done) {
      chai
        .request(server)
        .get('/api/threads/tests')
        .end(function (err, res) { 
		  for(let j = 0; j < res.body.length; j++){
			  //ids.push(res.body[j]._id);
			  //console.log("ewgtwegowergoerkgoerkgüoerkgperkgüperkpgüerkgpüerkgpüerg",res.body[j].delete_password);
			  //pw_ids.push(res.body[j].delete_password);
		  }
    console.log(ids);
          done();
        });
        });
    // Test 3 Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
	 test('Test 3 Deleting a thread with the incorrect password: DELETE request to /api/threads/tests with an invalid delete_password', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/threads/tests')
		.send({
			"thread_id": ids[1],
			"delete_password": "Musterpww"
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'incorrect password');
          done();
        });
    });
    //Test 4 Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
	 test('Test 4 Deleting a thread with the correct password: DELETE request to /api/threads/tests with an valid delete_password', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/threads/tests')
		.send({
			"thread_id": ids[0],
			"mark": "ich teste hier nur durch" + pw_ids[0],
			"delete_password": "Musterpw" //erster POST Eintrag ist ohne index
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'success');
          done();
        });
    });
    //Test 5 Reporting a thread: PUT request to /api/threads/{board}
	 test('Test 5 Reporting a thread: PUT request to  /api/threads/tests ', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/threads/tests')
		.send({
			"thread_id": ids[2] 
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'reported');
          done();
        });
    });
    //Test 6 Creating a new reply: POST request to /api/replies/{board}
	 test('Test 6 Creating a new reply: POST request to /api/replies/tests ', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post('/api/replies/tests')
		.send({
			"thread_id": ids[3], 
			"text": "Neuer Text für einen alten Thread",
			"delete_password": "passwort2" 
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/html'); // Umleitung
          done();
        });
    });
    //Test 7 Viewing a single thread with all replies: GET request to /api/replies/{board}
    test('Test 7 Viewing a single thread with all replies: GET request to /api/replies/tests', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/replies/tests?thread_id='+ids[3])
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'application/json');
          assert.isArray(res.body.replies, 'replies should be an array');
		  assert.isAtMost(res.body.replies.length, 3, 'replies should have at most 3 Elements');
		  //ids.push(res.body[j]._id);}
          console.log(ids);
          done();
        });
    });
	
	/********************************************/

let rep_ids = "";
let rep_ids1 = "";
let thread_id = "";
before('b4 get ids from threads', function(done) { 	
this.timeout(10000); // Timeout auf 10 Sekunden erhöhen

  // Zuerst einen neuen Thread erstellen
  chai
    .request(server)
    .post('/api/threads/tests')
    .send({ 
      "text": "Neuer Text für einen alten Thread",
      "delete_password": "passwort2" 
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);

      // Jetzt die Threads abrufen, um die ID des erstellten Threads zu bekommen
      chai
        .request(server)
        .get('/api/threads/tests')
        .end(function (err, res) { 
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');

          assert.isArray(res.body, 'Response body should be an array');
          assert.isAbove(res.body.length, 0, 'Array should have at least one element');

          // Die thread_id des ersten Threads speichern
          thread_id = res.body[0]._id;

          // Einen neuen Reply zu diesem Thread hinzufügen
          chai
            .request(server)
            .post('/api/replies/tests')
            .send({
              "thread_id": thread_id, 
              "text": "11Neuer Text für einen alten Reply11",
              "delete_password": "passwort21" 
            })
            .end(function (err, res) { 
              assert.equal(res.status, 200);
              //assert.equal(res.type, 'application/json');
              
              // Sicherstellen, dass die Replies ein Array sind und mindestens einen Eintrag enthalten
              //assert.isArray(res.body.replies, 'Replies should be an array');
              //assert.isAbove(res.body.replies.length, 0, 'Replies array should have at least one element');

              // Die ID des ersten Replies speichern
              //rep_ids = res.body.replies[0]._id;
              //rep_ids = res.body.replies[0]._id;
			  
          // Einen neuen Reply zu diesem Thread hinzufügen
          chai
            .request(server)
            .post('/api/replies/tests')
            .send({
              "thread_id": thread_id, 
              "text": "Alter Text für einen neuen Reply12",
              "delete_password": "passwort211" 
            })
            .end(function (err, res) { 
              //assert.equal(res.status, 200);
              //assert.equal(res.type, 'application/json');
              
              // Sicherstellen, dass die Replies ein Array sind und mindestens einen Eintrag enthalten
              //assert.isArray(res.body.replies, 'Replies should be an array');
              //assert.isAbove(res.body.replies.length, 0, 'Replies array should have at least one element');
              //rep_ids = res.body.replies[0]._id;
              //rep_ids1 = res.body.replies[1]._id;
              // Einen neuen Reply zu diesem Thread hinzufügen
          chai
            .request(server)
            .get('/api/replies/tests')
            .send({
              "thread_id": thread_id, 
            })
            .end(function (err, res) { 
              assert.equal(res.status, 200);
              assert.equal(res.type, 'application/json');
              
              // Sicherstellen, dass die Replies ein Array sind und mindestens einen Eintrag enthalten
              //assert.isArray(res.body.replies, 'Replies should be an array');
              //assert.isAbove(res.body.replies.length, 0, 'Replies array should have at least one element');
              rep_ids = res.body.replies[0]._id;
              rep_ids1 = res.body.replies[1]._id;
              done(); // Test hier beenden
            });
            });
            });
        });
    });
});

let promises = [];
let pw_rep_ids = [];
  for (let i = 0; i < 10; i++) {
    pw_rep_ids.unshift("passwort Nr. "+i);
    promises.push(
      chai
        .request(server)
        .post('/api/threads/tests')  // Use POST to create threads
        .send({
              "thread_id": thread_id, 
              "text": "Neuer Text für einen neuen Reply Nr. "+i,
              "delete_password": "passwort Nr."+i
        })
    );
  }
  // Wait for all promises to resolve
  Promise.all(promises)
    .then(responses => {
      responses.forEach((res, index) => {
        assert.equal(res.status, 200, `Reply ${index} was not created`);
      });
      done();
    })
    .catch(err => done(err));  // Handle any errors
    //Test 8 Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
    test('Test 8  Deleting a reply with the incorrect password: DELETE request to /api/replies/tests with an invalid delete_password', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/replies/tests')
		.send({
			"thread_id": thread_id,
			"reply_id": rep_ids,
			"delete_password": "Musterpww"
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'incorrect password');
          done();
        });
    });
    //Test 9 Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
    test('Test 9 Deleting a reply with the correct password: DELETE request to /api/replies/tests with a valid delete_password', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/replies/tests')
		.send({
			"thread_id": thread_id,
			"reply_id": rep_ids1,
			"delete_password": "passwort211"
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'success');
          done();
        });
    });
	
    //Test 10 Reporting a reply: PUT request to /api/replies/{board}
    test('Test 10 Reporting a reply: PUT request to  /api/replies/tests ', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/replies/tests')
		.send({
			"thread_id": thread_id,//ids[4],
			"reply_id": rep_ids
			})
        .end(function (err, res) {
          assert.equal(res.status, 200);
		  assert.equal(res.type, 'text/plain');
		  assert.equal(res.text, 'reported');
          done();
        });
    });
});
