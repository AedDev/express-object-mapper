# Express Object Mapper

### This documentation is valid for version 0.2.0-dev

The Express Object Mapper automatically maps incoming request parameters
to a predefined type. The type itself can provide informations about the
validation of each field. Within a type you also can define functions
which will be available on processing the request.

Here is a little example for a type definition. It provides some fields
and a function.
```javascript
// File: /mappings/MyType.js

// Object constructor defining default values for possible fields
function MyType() {
    this.name     = '';

    // As of version 0.2.0 you can define special properties for each field
    this.gender   = {
        type: 'string',
        possibleValues: [ 'male', 'female' ]
    };
    this.age      = 0;
    this.location = '';
    // ... and so on
}

module.exports = MyType;
```

You always have to define a default value for each field or an configuration
object as shown in the example above. For our field this.gender we defined
some restrictions. The field has to be typeof string and it just accepts two
values: male and female. In all other cases the request will get rejected with
an HTTP 500 status code.


To make use of the Object Mapper you have to instantitiate it in your application.
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
	res.status(200).send(req.dataObjects.MyType);
});

// Start the server
app.listen(8080, function(){
	console.log('Server is listening on 8080');
});

```