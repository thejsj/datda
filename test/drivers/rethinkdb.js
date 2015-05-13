require('should');
var _ = require('lodash');
var q = require('q');
var Promise = require('bluebird');
var RethinkDBDriver = require('../../lib/drivers/rethinkdb');
var r = require('rethinkdb');

var testDBName = 'motoreTest';
var defaultData = [
  { number: 1 },
  { number: 2 },
  { number: 3 }
];
var connectionOpts = {
  host: 'localhost',
  port: 28015,
  db: 'motoreTest'
};

var dropTestDatabase = function (done) {
  r.connect(this.connectionOpts)
    .then(function (conn) {
      r.dbDrop(testDBName).run(this.conn)
        .catch(function () { })
        .then(function () {
          return conn.close();
        })
        .then(done.bind(null, null));
    });
};

var insertTestData = function (done, data) {
  if (!data) data = defaultData;
  r.connect(this.connectionOpts)
    .then(function (conn) {
      r.dbDrop(testDBName).run(conn)
        .then(function () {
          return r.dbCreate(testDBName).run(conn);
        })
        .then(function () {
          conn.use(testDBName);
          return r.tableCreate('table1').run(conn)
            .catch(function () { });
        })
        .then(function () {
          return r.table('table1')
            .insert(data)
            .run(conn);
        })
        .then(function () {
          return r.table('table1').indexCreate('exampleIndex').run(conn)
            .catch(function () { });
        })
        .then(function () {
          return conn.close();
        })
        .nodeify(done);
    });
};

describe('RethinkDB', function () {

  var rdb;

  // Connect to Mongo
  before(function (done) {
    rdb = new RethinkDBDriver({
      host: 'localhost',
      port: 28015,
      db: 'motoreTest'
    }, {
      sourceOrTarget: 'source'
    });
    rdb.connect()
     .then(done.bind(null, null));
  });

  describe('connecting', function () {

    before(function (done) {
      r.connect(connectionOpts)
        .then(function (conn) {
          return r.dbCreate('motore').run(conn)
            .catch(function () { })
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

    var tables = ['table1', 'helloWorld' + Math.random(), ('anotherTable' + Math.random()).replace('.', '')];
    before(function (done) {
      r.connect(this.connectionOpts)
        .then(function (conn) {
          return r.dbDrop(testDBName).run(conn)
            .catch(function () { })
            .then(function () {
              return r.dbCreate(testDBName).run(conn);
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
        .then(function (tables) {
          _.pluck(tables, 'name').sort().should.eql(tables.sort());
          done();
        });
    });

    // After
    after(dropTestDatabase);
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
  });

  describe('getNumberOfRows', function () {

    before(insertTestData);

    it('should get the number of rows in a collection', function (done) {
      rdb.getNumberOfRows('table1')
        .then(function (numOfRows) {
          numOfRows.should.equal(3);
          done();
        })
        .catch(done);
    });

    after(dropTestDatabase);
  });

  describe('getRows', function () {

    before(insertTestData);

    it('should get the rows in a collection', function (done) {
      rdb.getRows('table1', 3, 0)
        .then(function (rows) {
          rows.should.be.an.Array;
          rows.length.should.equal(3);
          // NOTE: You can't guarantee the order of the documents
          _.pluck(rows, 'number').sort().should.eql([1, 2, 3]);
          done();
        });
    });

    after(dropTestDatabase);
  });

  describe('insertRows', function () {

    before(insertTestData);

    it('should insert the rows into the collection', function (done) {
      rdb.insertRows('table1', [{ hello: 1 }, { hello: 2 }])
       .then(function () {
         return rdb.getRows('table1', 10, 0);
       })
       .then(function (rows) {
         rows.length.should.equal(5);
         rows.should.containDeep([{ hello: 1 }, { hello : 2 }]);
         done();
       });
    });

    after(dropTestDatabase);
  });
});

