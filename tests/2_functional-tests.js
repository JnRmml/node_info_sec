/*
var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
*/
//(async () => {
/*  const chai = await import('chai');
  const chaiHttp = await import('chai-http');
  const assert = chai.assert;
  const server = (await import('../server.js')).default;
*/
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);


suite("Functional Tests", function() {

  suite("GET /api/stock-prices => stockData object", function() {
    //this.timeout(5000);
    //wait for 4 sec after every test
    let numOflike;
    //this.afterEach(function(done) {
    //  setTimeout(() => {
    //    done();
    //  }, 4000);
    //});
/**/

    before("b4 1 stock", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end(function(err, res) {
          //complete this one too
          assert.equal(res.status, 200, err);
          assert.isObject(res.body.stockData, "Body should be object");
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          assert.equal(res.body.stockData.stock, "GOOG");
          numOflike = res.body.stockData.likes;
          done();
        });
    });
	// Test 1
    test("Test 1: 1 stock", function(done) {
		console.log("Starting test: 1 stock");
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end(function(err, res) {
          //complete this one too
          assert.equal(res.status, 200);
          assert.isObject(res.body.stockData, "Body should be object");
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          assert.equal(res.body.stockData.stock, "GOOG");
          //numOflike = res.body.stockData.likes;
          done();
        });
    });
	// Test 2
    test("Test 2: 1 stock with like", function(done) {
        console.log("Starting test 2: 1 stock with like");
	  chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isNumber(res.body.stockData.price, "price");
          assert.equal(res.body.stockData.likes, numOflike);
          done();
        });
    });
    // Test 3
    test("Test 3: 1 stock with like again (ensure likes arent double counted)", function(done) {
        console.log("Starting test 3: 1 stock with like again (ensure likes arent double counted)");
	  chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.likes, numOflike);
          assert.equal(res.body.stockData.stock, "GOOG");
          done();
        });
    });
    // Test 4
    test("Test 4: 2 stocks", function(done) {
        console.log("Starting test 4: 2 stocks");
	  chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.isNumber(res.body.stockData[0].rel_likes, "should be number");
          assert.isNumber(res.body.stockData[1].rel_likes, "should be number");
          numOflike = [
            res.body.stockData[0].rel_likes,
            res.body.stockData[1].rel_likes
          ];
          done();
        });
    });
    
	// Test 5
    test("Test 5: 2 stocks with like", function(done) {
        console.log("Starting test 5: 2 stock with like");
	  chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"], like: "true" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.isNumber(res.body.stockData[0].rel_likes, "should be number");
          assert.isNumber(res.body.stockData[1].rel_likes, "should be number");
          assert.equal(res.body.stockData[0].rel_likes, numOflike[0] );
          assert.equal(res.body.stockData[1].rel_likes, numOflike[1] );
        
          done();
        });
    });
    /**/
  });
});
//});