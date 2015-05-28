## Todo

[x] Input Validation
  [x] Check that database credentials are correct
  [x] Check that there is a `source` and `target` defined
[x] Connect to the database
[x] Create database
  [x] If database is `source`, make sure database exists
  [x] If database is `target`, make sure database doesn't exist
[x] Get all tables, collections
[x] Primary Keys
  [x] Get primary key for each table in RethinkDB
  [x] Ensure that `_id` is an index
  [x] RethinkDB should use the index when creating the table
  [x] MongoDB should throw an error when not passed `_id` as an index
  [x] MongoDB's `\_id`s should always be converted to `id`
  [x] RethinkDB's primary key should always be converted to `_id`
[x] Create recursive function to get/insert documents/rows
  [x] Add mapping function
  [x] Map \_id to id
[x] Add logging
  [x] Add timestamps to log
  [x] Wrap console.log
[ ] Testing
  [x] Test with 20,000+ rows
  [x] Test with different primary keys (email)
  [ ] Fix `Sockets Closed` message in tests
[ ] CLI
  [x] Finish CLI
  [x] Test CLI
  [ ] Add progress bars for each table
  [ ] Add `.info`, `.warn`, etc
[ ] Primary Keys
  [ ] Fix use case for `_id` and `id`
  [ ] What happens if you're importing something into RethinkDB and it has an `id` and a `_id`
  [x] Use other primary key as primary key in mapping
[x] Improve README
 [x] Explain that the primary index gets imported, but not the secondary indexes
 [x] Give examples of the CLI
 [x] Explain that `id` gets replaced with `_id`
[ ] Add options for `--r2m`
[ ] Change name in README

## Future Features

[ ] Change get/insert to stream
[ ] Import only certain tables from a database
[ ] Append tables to database instead of making sure the database doesn't exist

```
  --collections/--tables table_name,collection_name
                              // Limit the collections/tables you wish to import from the database (Default: All tables)
  --convert_id                // Convert Mongos’s _id to RethinkDB’s id and vice versa (Default: true)
  --append_to_table           // Append to table if table already exists (Default: false)
  --log                       // Log output
  --help                      // Help
```
