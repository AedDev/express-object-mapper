var Q = require('q');
var _ = require('underscore');

var self;

function ObjectMapper() {
    self = this;

    // Predefine empty mappings object
    self.mappings = {};
}

function processTypes(typesObject) {
    if (typeof(typesObject) !== 'object') throw new Error('Mappings configuration has to be an object');

    var newMappings = {};
    for (var typeName in typesObject) {
        if (typeof(typesObject[typeName]) === 'string') {
            // Apply defaults to types which just point on their target
            newMappings[typeName] = {
                path: typesObject[typeName],
                strictTypes: false
            };
        } else {
            newMappings[typeName] = typesObject[typeName];
        }
    }

    return newMappings;
}

function checkType(value, type) {
    switch(type) {
        case 'number': return !isNaN(value);
        case 'string': return _.isString(value);
        case 'boolean': return _.isBoolean(value);
        case 'function': return _.isFunction(value);
        case 'object': return _.isObject(value) || _.isArray(value);
        default: return false;
    }
}

ObjectMapper.prototype.config = function(options) {
    if (!options) throw new Error('No options provided');

    // Path given, try to require
    if (typeof(options.mappings) === 'string') {
        self.mappings = processTypes(require(options.mappings));
    // Configuration object given
    } else if (typeof(options.mappings) === 'object') {
        self.mappings = processTypes(options.mappings);
    }
};

ObjectMapper.prototype.map = function(options) {
    var deferred = Q.defer();

    if (!self.mappings[options.objectType]) {
        deferred.reject(new Error('Unknown object type given: ' + options.objectType));
    }

    // Instantitiate object for type
    var classObject = require(process.cwd() + '/' + self.mappings[options.objectType].path);
    var object      = new classObject();

    var fields = options.requestData.query;
    for (var fieldName in fields) {
        // Only assign
        if (_.isUndefined(object[fieldName]) === false) {
            // Check strict mode
            if (checkType(fields[fieldName], typeof(object[fieldName])) !== true) {
                var errMsg = 'Type missmatch for parameter "' + fieldName + '"! Expected: [' + typeof(object[fieldName]) + '] Given: [' + typeof(fields[fieldName]) + ']';
                deferred.reject(new Error(errMsg));
            }

            object[fieldName] = fields[fieldName];
        }
    }

    // We're done!
    deferred.resolve(object);

    return deferred.promise;
};

ObjectMapper.prototype.middleware = function(req, res, next) {
    if (req.query.objectType) {
        var objectType = req.query.objectType;

        // Build and map new data object based on given data
        self.map({
            objectType: objectType,
            requestData: req
        }).then(function(mappedObject){
            // Create dataObjects array if not existing
            if (!req.dataObjects) {
                req.dataObjects = {};
            }

            // Store mapped object in request data
            req.dataObjects[objectType] = mappedObject;

            next();
        }, function(error){
            console.error(error);

            next();
        });
    }
};

module.exports = ObjectMapper;
