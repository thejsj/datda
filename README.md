# Motore

Import MongoDB database and tables into RethinkDB. Import RethinkDB databases into MongoDB.

This module helps you easily import databases to/from MongoDB to RethinkDB. The implementation is very simple. Motore merely gets all the collecitons/tables in your database and gets all the documents/rows in that collectiont/table and inserts them into the other database.

## Install

To use the CLI:
```
npm install -g motore
```

To use in your node app:
```
npm install motore
```

## API

### CLI

```
motore
  --source [mongo/rethinkdb]  // Specify wether to import from MongoDB to RethinkDB or from RethinkDB to Mongo (Default: `mongo`)
  --target [mongo/rethinkdb]  // Specify wether to import to MongoDB to RethinkDB or from RethinkDB to Mongo (Default: `rethinkdb`)
  --db                        // Name of database (Can be overwritten by `rdb_db` and `mongo_db`)

  --mongo_db name_of_database
  --mongo_host host           // (Default: 27017)
  --mongo_port mongoport      // (Defulat: ‘localhost’)

  --rdb_db_ name_of_database
  --rdb_port port_number      // (Default: 28015)
  --rdb_host host             // (Default: ‘localhost’)

  --collections/--tables table_name,collection_name
                              // Limit the collections/tables you wish to import from the database (Default: All tables)
  --convert_id                // Convert Mongos’s _id to RethinkDB’s id and vice versa (Default: true)
  --append_to_table           // Append to table if table already exists (Default: false)
  --rows_per_batch            // Number of documents/rows per insert query (Default: 1000)
  --log                       // Log output
  --help                      // Help
```

### Code

```
var motore = require('motore');

motore.import({
  source: 'mongo',
  target: 'rethinkdb',
  mongo: {
    host: 'localhost',
    port: 8080,
    db: ‘db’
  },
  rethinkdb: {
    host: 'localhost',
    port: 28015,
    db: 'db'
  },
  collections: ['table_1', 'table_2'],
  convertId: true,
  appendToTable: false,
  rowsPerBatch: 10000
})
.then(function (log) {
  // Import log object
});
```

## FAQs

**Will my data get overwritten if the database already exists?**

No. `import` expects your source database to exist and your target database **not** to exists. If you want to append the tables to a database, you can pass along the `--append` option, which will first check if no tables would get overwritten, and then creates the tables in the database.

**Will primary indexes get imported as primary indexes?**

Yes. `import` imports the primary index from and to the databases.

**Will secondary indexes get imported?

No. Importing secondary indexes is not supported.

