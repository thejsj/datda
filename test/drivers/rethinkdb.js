require('should');
var _ = require('lodash');
var q = require('q');
var Promise = require('bluebird');
var RethinkDBDriver = require('../../lib/drivers/rethinkdb');
var r = require('rethinkdb');
var utils = require('../utils');

var testData = [
  { number: 1 },
  { number: 2 },
  { number: 3 }
];

var connectionOpts = {
  host: 'localhost',
  port: 28015,
  db: 'motoreTest'
};

var tableConfig = {
  name: 'table1',
  primaryKey: 'id'
};

describe('RethinkDB', function () {

  var rdb;

  // Connect to Mongo
  before(function (done) {
    utils.insertRethinkDBTestData(connectionOpts, testData)(function () {})
      .then(function () {
        rdb = new RethinkDBDriver(connectionOpts, {
          sourceOrTarget: 'source'
        });
        rdb.connect()
         .then(done.bind(null, null));
      });
  });

  describe('connecting', function () {

    before(function (done) {
      r.connect(connectionOpts)
        .then(function (conn) {
          return r.dbCreate('motore').run(conn)
            .catch(function () { });
        })
        .then(done.bind(null, null));
    });

    it('should have connected propertly', function () {
      rdb.conn.should.be.a.Object;
    });

    // TODO: Should it throw an error? It should create it by default
    it('should throw an error if its the source and the database doesn\'t exist', function (done) {
      var conn = new RethinkDBDriver({
          host: 'localhost',
          port: 28015,
          db: 'databaseThatDoesntExist'
        }, {
          sourceOrTarget: 'source'
        });
        conn.connect()
         .catch(function (err) {
           err.message.should.match(/exist/);
           err.message.should.match(/database/);
           err.message.should.match(/source/i);
           done();
         });
    });

    it('should throw an error if its the target and the database exist', function (done) {
      var conn = new RethinkDBDriver({
          host: 'localhost',
          port: 28015,
          db: 'motore'
        }, {
          sourceOrTarget: 'target'
        });
        conn.connect()
         .catch(function (err) {
           err.message.should.match(/exist/);
           err.message.should.match(/database/);
           err.message.should.match(/target/i);
           done();
         });
    });

    it('should throw an error if it can\'t connect to the host', function (done) {
        var conn = new RethinkDBDriver({
          host: 'localhost',
          port: 9999,
          db: 'databaseThatDoesntExist'
        }, {
          sourceOrTarget: 'source'
        });
        conn.connect()
         .catch(function (err) {
           err.name.should.equal('RqlDriverError');
           err.message.indexOf('ECONNREFUSED').should.not.equal(-1);
           done();
         });
    });

  });

  describe('getTables', function () {

    var tables = ['table1', 'helloWorld', ('anotherTable' + Math.random()).replace('.', '')];
    before(function (done) {
      r.connect(connectionOpts)
        .then(function (conn) {
          return r.dbDrop(connectionOpts.db).run(conn)
            .catch(function () { })
            .then(function () {
              return r.dbCreate(connectionOpts.db).run(conn);
            })
            .then(function () {
              return q.all(tables.map(function (table) {
                return r.tableCreate(table).run(conn)
                  .catch(function () { })
                  .then(function () {
                    return r.table(table).indexCreate('exampleIndex');
                  });
              }));
            })
            .then(function () {
              return conn.close();
            });
        })
        .nodeify(done);
    });

    it('should get all the tables in the database as an object with a name property', function (done) {
      rdb.getTables()
        .then(function (_tables) {
          _.pluck(_tables, 'name').sort().should.eql(tables.sort());
          done();
        });
    });

    it('should provide the primary key for every table', function (done) {
      rdb.getTables()
        .then(function (_tables) {
          var primaryIndexes = _.pluck(_tables, 'primaryIndex');
          primaryIndexes.length.should.equal(tables.length);
          _.unique(primaryIndexes).should.eql(['id']);
          done();
        })
        .catch(done);
    });

    // After
    after(utils.dropRethinkDBTestDatabase(connectionOpts));
  });

  describe('createTables', function () {

    it('should create tables passed to it as an object', function (done) {
      var tables = [
        { name: 'hello' },
        { name: ('hello' + Math.random()).replace('.', '') },
        { name: 'hello2' },
      ];
      rdb.createTables(tables)
        .then(function () {
          return rdb.getTables();
        })
        .then(function (_tables) {
          _.pluck(tables, 'name').sort().should.eql(_.pluck(tables, 'name').sort());
          done();
        })
        .catch(done);
    });

    it('should create tables with an primaryKey that\'s not id', function (done) {
      var tables = [
        { name: 'not_id', primaryKey: 'not_id' }
      ];
      rdb.createTables(tables)
        .then(function () {
          return rdb.getTables();
        })
        .then(function (_tables) {
          _.pluck(tables, 'name').should.eql(['not_id']);
          _.pluck(tables, 'primaryKey').should.eql(['not_id']);
          done();
        })
        .catch(done);
    });
  });

  describe('getNumberOfRows', function () {

    before(utils.insertRethinkDBTestData(connectionOpts, testData));

    it('should get the number of rows in a collection', function (done) {
      rdb.getNumberOfRows(tableConfig)
        .then(function (numOfRows) {
          numOfRows.should.equal(3);
          done();
        })
        .catch(done);
    });

    after(utils.dropRethinkDBTestDatabase(connectionOpts));
  });

  describe('getRows', function () {

    before(utils.insertRethinkDBTestData(connectionOpts, testData));

    it('should get the rows in a collection', function (done) {
      rdb.getRows(tableConfig, 3, 0)
        .then(function (rows) {
          rows.should.be.an.Array;
          rows.length.should.equal(3);
          // NOTE: You can't guarantee the order of the documents
          _.pluck(rows, 'number').sort().should.eql([1, 2, 3]);
          done();
        });
    });

    after(utils.dropRethinkDBTestDatabase(connectionOpts));
  });

  describe('insertRows', function () {

    before(utils.insertRethinkDBTestData(connectionOpts, testData));

    it('should insert the rows into the collection', function (done) {
      rdb.insertRows(tableConfig, [{ hello: 1 }, { hello: 2 }])
       .then(function () {
         return rdb.getRows(tableConfig, 10, 0);
       })
       .then(function (rows) {
         rows.length.should.equal(5);
         rows.should.containDeep([{ hello: 1 }, { hello : 2 }]);
         done();
       });
    });

    after(utils.dropRethinkDBTestDatabase(connectionOpts));
  });
});

