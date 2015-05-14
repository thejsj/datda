## Todo

[x] Input Validation
  [x] Check that database credentials are correct
  [x] Check that there is a `source` and `target` defined
[x] Connect to the database
[x] Create database
  [x] If database is `source`, make sure database exists
  [x] If database is `target`, make sure database doesn't exist
[x] Get all tables, collections
[ ] Primary Keys
  [ ] Get primary key for each table in RethinkDB
  [ ] Ensure that `_id` is an index
  [ ] Add index when creating tables
[ ] Create recursive function to get/insert documents/rows
  [ ] Add mapping function
  [ ] Map \_id to id
