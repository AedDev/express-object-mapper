# Express Object Mapper

Here is your solution to prevent manual parameter mapping and redundant in
express.js!

You can easily pass the express-object-mapper middleware to your express
application. You just have to define your object structure like this:

```javascript
// File: /mappings/MyType.js

// Object constructor defining default values for possible fields
function MyType() {
    this.name     = '';
    this.gender   = '';
    this.age      = 0;
    this.location = '';
    // ... and so on
}

module.exports = MyType;
```

To use the ObjectMapper you just need the following:
```javascript
// File: server.js

var express = require('express');
var ObjectMapper = require('express-object-mapper');

var app = express();

// Create a new ObjectMapper instance
var mapper = new ObjectMapper();

// Configure the ObjectMapper
mapper.config({
    mappings: {
        'MyType': 'mappings/MyType'
    }
});

// You can also tell the ObjectMapper to work with strict types
// The mapper will look which type is used in your type definition
// and refuse the mapping, if it doesnt match.
// Activate strict mode by using the following:
mapper.config({
    mappings: {
        'MyType': {
        	path: 'mappings/MyType',
        	strictTypes: true
    	}
    }
});

// Register the ObjectMapper middleware
app.use(mapper.middleware);

// Register a route on path /
// When calling the route with query parameter objectType=MyType the
// mapper will apply all input parameters where the names are also
// defined in MyType.
//
// For example you call http://localhost:8080/?objectType=MyType&name=Max
// you'll get your input data back as mapped object.
app.get('/', function(req, res){
	res.status(200).send(req.dataObjects['MyType']);
});

// Start the server
app.listen(8080, function(){
	console.log('Server is listening on 8080');
});

```