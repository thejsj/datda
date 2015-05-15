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
[ ] Create recursive function to get/insert documents/rows
  [ ] Add mapping function
  [ ] Map \_id to id
