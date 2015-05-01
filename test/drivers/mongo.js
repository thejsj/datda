require('should');
var MongoDriver = require('../../lib/drivers/mongodb');

describe('MongoDB', function () {

  var mongo;

  // Connect to Mongo
  before(function (done) {
    mongo = new MongoDriver({
      host: 'localhost',
      port: 27017,
      db: 'motoreTest'
    });
    mongo.connect()
     .then(done);
  });

  describe('connecting', function () {

    it('should have connected propertly', function () {
      mongo.conn.should.be.a.Object;
    });

    // Doesn't work
    xit('should throw an error if the database doesn\'t exists', function (done) {
      var conn = new MongoDriver({
          host: 'localhost',
          port: 27017,
          db: 'databaseThatDoesntExist'
        });
        conn.connect()
         .then(function () {
           //console.log('DB Connection');
           //console.log(conn.conn);
           done();
         })
         .catch(function (err) {
           //console.log('Error', err);
           done();
         });
    });

    it('should throw an error if it can\'t connect to the host', function (done) {
        var conn = new MongoDriver({
          host: 'localhost',
          port: 9999,
          db: 'databaseThatDoesntExist'
        });
        conn.connect()
         .catch(function (err) {
           err.name.should.equal('MongoError');
           err.message.indexOf('ECONNREFUSED').should.not.equal(-1);
           done();
         });
    });

  });

  describe('getTables', function () {

    before(function () {

    });

    xit('should get all the tables in the database', function (done) {
      done();
    });
  });
});
