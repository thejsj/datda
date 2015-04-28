# Import MongoDB into RethinkDB

Import MongoDB database and tables into RethinkDB. Import RethinkDB databases into MongoDB.

## Install

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
  convert_id: true,
  append: false
})
.then(function (log) {
  // Import log object
})
```
