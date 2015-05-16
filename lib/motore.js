var q = require('q');

var MongoDBClient = require('./drivers/mongodb');
var RethinkDBClient = require('./drivers/rethinkdb');
var validateOptions = require('./validate-options');

var motore = function (options) {
    // 1. Validate Options
    options = validateOptions(options);
    // 2. Instanstiate Drivers
    var sourceDB = (function () {
        if (options.source === 'rethinkdb') {
          return new RethinkDBClient(options.rethinkdb, { sourceOrTarget: 'source' });
        }
        if (options.source === 'mongodb') {
          return new MongoDBClient(options.mongodb, { sourceOrTarget: 'source' });
        }
    }());
    var targetDB = (function () {
        if (options.target === 'rethinkdb') {
          return new RethinkDBClient(options.rethinkdb, { sourceOrTarget: 'target' });
        }
        if (options.target === 'mongodb') {
          return new MongoDBClient(options.mongodb, { sourceOrTarget: 'target' });
        }
    }());
    // Return a promise
    return q()
      .then(function () {
         console.log('Connecting To Source DB');
          // 3. Connect to Both Databases
          return sourceDB.connect()
            .then(function () {
              console.log('Connecting to Target DB');
              return targetDB.connect();
            });
      })
      .then(function () {
        console.log('Getting Tables from source database');
        // 4. Get a list of tables from the source database (if `collections` is not defined)/Create Tables in target database
        return sourceDB.getTables()
          .then(function (tables) {
            console.log('Creating Tables in target database');
            return targetDB.createTables(tables)
              .then(function () {
                console.log('Starting to Insert Rows');
                return q.all(tables.map(function (tableConfig) {
                    return sourceDB.getNumberOfRows(tableConfig)
                      .then(function (numberOfRows) {
                        console.log('NumberOfRows', numberOfRows);
                        // 5. Start recursive importing
                        // TODO: Add recursive importing...
                        // 6. Finish Operation
                        // TODO: Get Metadata object
                      });
                }));
            });
        });
    });
};
module.exports = motore;
