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

To register your type you just have to do the following BEFORE any routes are
called:

```javascript
// ... your application code

// Load ObjectMapper module
var ObjectMapper = require('express-object-mapper').ObjectMapper;

// Create new ObjectMapper instance
var mapper = new ObjectMapper();

// Configure ObjectMapper
mapper.config({
    mappings: {
        'MyType': './mappings/MyType'
    }
});

// You can also provide a configuration file
mapper.config({
    mappings: './map_config' // Would point to map_config.js which has to export a JSON configuration
});

// ... your application code
```


```javascript
// ... your application code

// Apply middleware to Express - You have to provide the mapper object!
express.use(mapper.middleware(mapper));

// ... your application code
```


