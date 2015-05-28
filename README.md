# datda

Import databases between MongoDB and RethinkDB.

This module helps you easily import MongoDB database into RethinkDB and back. The implementation is very simple. datda merely gets all the collecitons/tables in your database and gets all the documents/rows in that collectiont/table and inserts them into the other database. The beauty of JSON document stores.

## Install

To use the CLI:
```
npm install -g datda
```

To use in your node app:
```
npm install datda
```

## API

### CLI

```
datda
  --m2r                        // Set MongoDB as the source database and RethinkDB as the target database. Overwrites `source` and `target`.
  --r2m                        // Set RethinkDB as the source database and MongoDB as the target database. Overwrites `source` and `target`.

  --source [mongodb/rethinkdb] // Specify whether to import from MongoDB to RethinkDB or from RethinkDB to Mongo (Default: `mongo`)
  --target [mongodb/rethinkdb] // Specify whether to import to MongoDB to RethinkDB or from RethinkDB to Mongo (Default: `rethinkdb`)

  --db                         // Name of database (Can be overwritten by `rdb_db` and `mongo_db`)

  --mdb_db name_of_database
  --mdb_host host              // (Default: 27017)
  --mdb_port mongoport         // (Defulat: ‘localhost’)

  --rdb_db_ name_of_database
  --rdb_port port_number       // (Default: 28015)
  --rdb_host host              // (Default: ‘localhost’)

  --rows_per_batch             // Number of documents/rows per insert query (Default: 1000)
  --log                        // Wheter to log out important events and progress (Default: false)
```

### Examples

Importing the `hello` database from MongoDB into RethinkDB
```
datda --m2r --db hello
```

Importing the `hello_mongo` database from MongoDB into a database called `hello_rethinkb` in RethinkDB.

```
datda --m2r --mdb_db hello_mongo --rdb_db hello_rethinkdb
```

Importing the `hello` database from a remote RethinkDB instance into a local MongoDB instance.

```
datda --r2m --mdb_host 123.123.123.123 --db hello
```

### Node.js

```
var datda = require('mtr');

datda({
  source: 'mongodb',
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
  }
})
.then(function (importLog) {
  // Import log object
});
```

### Examples

Importing the `hello` database from MongoDB into RethinkDB
```
datda({
  db: 'hello'
})
.then(function() { });
```

Importing the `hello_mongo` database from MongoDB into a database called `hello_rethinkb` in RethinkDB.

```
datda({
  mongodb: {
    db: 'hello_mongo'
  },
  rethinkdb: {
    db: 'hello_rethinkdb'
  }
})
.then(function() { });
```

Importing the `hello` database from a remote RethinkDB instance into a local MongoDB instance.

```
datda({
  source: 'rethinkdb',
  target: 'mongodb',
  db: 'hello',
  mongodb: {
    host: '123.123.123.123'
  },
  rethinkdb: {
    db: 'hello_rethinkdb'
  }
})
.then(function() { });
```

## FAQs

**Will my data get overwritten if the database already exists?**

No. datda expects your source database to exist and your target database **not** to exist. It will created the database automatically.

**Will primary indexes get imported as primary indexes?**

Yes. datda imports the primary index from and to the database. If the source database is MongoDB, it will import the `_id` into `id`, deleting a preexisting `id` property. If RethinkDB is the source database, it will import whatever the primaryIndex is in that table into the `_id` property in MongoDB, deleting anything previously in the `_id` property.

**Will secondary indexes get imported?**

No. Importing secondary indexes is not supported.

