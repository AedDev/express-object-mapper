var Promise = require('promise');

var self;

function ObjectMapper() {
    self = this;

    // Predefine empty mappings object
    self.mappings = {};
}

ObjectMapper.prototype.config = function(options) {
    if (!options) throw new Error('No options provided');

    // Path given, try to require
    if (typeof(options.mappings) === 'string') {
        self.mappings = require(options.mappings);
    // Configuration object given
    } else if (typeof(options.mappings) === 'object') {
        self.mappings = options.mappings;
    }
};

ObjectMapper.prototype.map = function(options) {
    return new Promise(function(resolve, reject){
        if (!self.mappings[options.objectType]) {
            reject('Unknown object type given: ' + options.objectType);
        }

        // Instantitiate object for type
        var object = new (require(process.cwd() + '/' + self.mappings[options.objectType]))();

        var fields = options.requestData.query;
        for (var fieldName in fields) {
            // Only assign
            if (typeof(object[fieldName]) !== 'undefined') {
                object[fieldName] = fields[fieldName];
            }
        }

        resolve(object);
    });
};

ObjectMapper.prototype.middleware = function(req, res, next) {
    if (req.query.objectType) {
        var objectType = req.query.objectType;

        // Build and map new data object based on given data
        self.map({
            objectType: objectType,
            requestData: req
        }).then(function(mappedObject){
            console.log('Mapping to type ' + req.query.objectType);
            
            // Create dataObjects array if not existing
            if (!req.dataObjects) {
                req.dataObjects = [];
            }

            // Create dataObjects array for current objectType if not existing
            if (!req.dataObjects[objectType]) {
                req.dataObjects[objectType] = [];
            }

            // Push mapped object to array of mapped types for this objectType
            req.dataObjects[objectType].push(mappedObject);
            next();
        }).catch(function(error){
            console.error(error);
        }).done(function(){
            next();
        });
    }
};

module.exports = ObjectMapper;
