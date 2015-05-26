var Promise = require('bluebird');

var MongoDBClient = require('./clients/mongodb');
var RethinkDBClient = require('./clients/rethinkdb');
var validateOptions = require('./validate-options');

var importDatabase = function (options) {
    // 1. Validate Options
    options = validateOptions(options);

    var importLog = {
      logs: []
    };

   var log = function (message) {
     var time = new Date();
     if (options.log) {
       console.log('mtr : ' + time + ' : ' + message);
     }
     importLog.logs.push(time + ' : ' + message);
   };

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
    return Promise.resolve()
      .then(function () {
         log('Connecting To Source DB');
          // 3. Connect to Both Databases
          return sourceDB.connect()
            .then(function () {
              log('Connecting to Target DB');
              return targetDB.connect();
            });
      })
      .then(function () {
        log('Getting Tables from source database');
        // 4. Get a list of tables from the source database (if `collections` is not defined)/Create Tables in target database
        return sourceDB.getTables()
          .then(function (tables) {
            importLog.tables = (function () {
              var obj = {};
              tables.forEach(function (table) {
                obj[table.name] = table;
              });
              return obj;
            }());
            log('Creating Tables in target database');
            return targetDB.createTables(tables)
              .then(function () {
                return Promise.all(tables.map(function (tableConfig) {
                    return sourceDB.getNumberOfRows(tableConfig)
                      .then(function (numberOfRows) {
                        log('Starting to Insert Rows into `' + tableConfig.name + '`');
                        importLog.tables[tableConfig.name].numberOfRows = numberOfRows;

                        // Recursive Function
                        var recursiveInsert = function (numberOfRows, currentRow, previousRow) {
                          // Finish
                          if (currentRow >= numberOfRows) {
                            return true;
                          }
                          var rowsToInsert = options.rowsPerBatch;
                          if ((numberOfRows - (currentRow + rowsToInsert)) < 0) {
                            rowsToInsert = numberOfRows - currentRow;
                          }
                          log('Table `' + tableConfig.name + '` : Row (' + (previousRow + 1) + ' - ' + rowsToInsert + ')/' + numberOfRows);
                          return sourceDB.getRows(tableConfig, rowsToInsert, currentRow)
                           .then(function (rows) {
                             // This is RethinkDB to MongoDB specific
                             // This functions should be part of the logic of the client, not this ...
                             rows = rows.map(sourceDB.mapExportedRow.bind(sourceDB, tableConfig));
                             rows = rows.map(targetDB.mapImportedRow.bind(targetDB, tableConfig));
                             return targetDB.insertRows(tableConfig, rows);
                           })
                           .then(function () {
                             return recursiveInsert(numberOfRows, currentRow + options.rowsPerBatch, currentRow);
                           });
                        };
                        // 5. Start recursive importing
                        return recursiveInsert(numberOfRows, 0, -1);
                      });
                }));
            });
        });
    })
    .then(function () {
      log('Import Completed');
      return importLog;
    });
};

module.exports = importDatabase;
