require('should');

//require('./validate-options');
describe('Drivers', function() {
  require('./drivers/mongodb');
  require('./drivers/rethinkdb');
});

describe('Import', function () {
  require('./import/mongodb-to-rethinkdb');
  require('./import/rethinkdb-to-mongodb');
});
