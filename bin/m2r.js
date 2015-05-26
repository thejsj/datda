#! /usr/bin/env node
var cli = require('cli').enable('status');
var mtr = require('../lib/mtr');

cli.parse({
  source:          [false, 'Specify wether to import from MongoDB to RethinkDB or from RethinkDB to Mongo', 'string', 'mongodb'],
  target:          [false, 'Specify wether to import to MongoDB or to RethinkDB','string', 'rethinkdb'],
  db:              [false, 'Name of database (Can be overwritten by `rdb_db` and `mongo_db`)', 'string'],

  mdb_db:          [false, 'Name of MongoDB database', 'string'],
  mdb_host:        [false, 'Host for MongoDB', 'string', 'localhost'],
  mdb_port:        [false, 'Port for MongoDB', 'number', 27017],

  rdb_db:          [false, 'Name of RethinkdbDB database', 'string'],
  rdb_host:        [false, 'Host for RethinkDB', 'string', 'localhost'],
  rdb_port:        [false, 'Port for RethinkDB', 'number', 28015],

  rows_per_batch: [false, 'Number of documents/rows per insert query', 'number', 1000],
  no_log:         ['l', 'Whether to log events and progress (logs by default)', 'boolean', false]
});

cli.main(function (args, opts) {
  mtr({
    source: opts.source,
    target: opts.target,
    db: opts.db,
    log: !opts.no_log,
    rowsPerBatch: opts.rows_per_batch,
    rethinkdb: {
      host: opts.rdb_host,
      port: opts.rdb_port,
      db:   opts.rdb_db,
    },
    mongodb: {
      host: opts.mdb_host,
      port: opts.mdb_port,
      db:   opts.mdb_db,
    },
  })
  .catch(function (err) {
    console.log(err);
  })
  .then(function () {
    process.exit();
  });
});
