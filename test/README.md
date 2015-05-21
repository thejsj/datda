## Testing

In order to run all tests (except test for 100,000 rows), run the following command:

```
npm test
```
In order to test only the database clients, run the following:
```
npm run test-clients
```
In order to test only the database import, run the following:
```
npm run test-import
```
In order to test importing a bigger data set into RethinkDB, do the following:
```
python test/generate-random-documents.py
mongoimport --db mtrBigTest -c data --jsonArray ./test/data-100000-documents.json
./bin/mtr.js --db mtrBigTest
```
