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
  --from [mongo/rethinkdb]    // Specify wether to import from MongoDB to RethinkDB or from RethinkDB to Mongo (Default: `mongo`)
  --db                        // Name of database (Can be overwritten by `rdb_db` and `mongo_db`)

  --mongo_db name_of_database
  --mongo_host host           // (Default: 27017)
  --mongo_port mongoport      // (Defulat: ‘localhost’)

  --rdb_db_ name_of_database
  --rdb_port port_number      // (Default: 28015)
  --rdb_host host             // (Default: ‘localhost’)

  --collections/--tables table_name,collection_name
                              // Limit the collections/tables you wish to import from the database (Default: All tables)
  --convert_id                // Convert Mongos’s _id to RethinkDB’s id and vice versa (Default: false)
  --append                    // Append to table if table already exists (Default: false)
  --batch                     // Number of documents/rows per insert query (Default: 1000)
  --log                       // Log output
  --help                      // Help
```

### Code

```
var motore = require(‘motore’);

motore.import({
  from: ‘mongo’,
  mongo: {
    host: ‘localhost’,
    port: 8080,
    db: ‘db’
  },
  rethinkdb: {
    host: ‘localhost’,
    port: 28015,
    db: ‘db’
  },
  collections: [‘table_1’, ‘table_2’],
  convertId: true,
  append: false
})
.then(function (log) {
  // Import log object
});
```
