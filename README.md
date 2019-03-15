# Avg Cubic Weight Calculating Service

## Install， Run and Testing:
To install:
```
$ npm install
```

To run:
```
$ node app.js
```

## Key Design / Implementation Notes:
* Each page's avg cubic weight is calculated separately, and then "joined to update" overall cubic weight, so that the 
maximum number we have to handle is the total of cubic weight in a single page, not all products in the category
* Service is modularised for reusing
* Category parameter is optional. Setting it to null can calculate all products in all categories
* Page avg is calculated separately

