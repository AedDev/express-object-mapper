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

function checkType(value, objectField) {
    /*
     * The type can be extracted in multiple ways:
     * * If the target object property is an object, we can obtain it ...
     * * * from the field type
     * * * from type type of default value which is stored in the field value
     * * If the target object property is not an object, we obtain the type from given value
     */
    var type = _.isObject(objectField) ? (objectField.type || typeof(objectField.value)) : typeof(objectField);

    switch(type) {
        case 'number': return !isNaN(value);
        case 'string': return _.isString(value);
        case 'boolean': return _.isBoolean(value);
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

ObjectMapper.prototype.validate = function(targetObject, objectType, fieldName, fieldData) {
    var isValid = true;
    var errors = [];

    // Check target object has the required property
    if (_.isUndefined(targetObject[fieldName])) {
        isValid = false;
        errors.push('Given field ' + fieldName + ' is not defined for objectType ' + objectType);
    }

    // Check data type of field matches the required property type
    if (checkType(fieldData, targetObject[fieldName]) !== true) {
        isValid = false;
        errors.push('Invalid type given for field ' + fieldName);
    }

    // Check if value matches possible inputs for target property
    if (_.isObject(targetObject[fieldName]) && targetObject[fieldName].possibleValues) {
        var possibleValues = targetObject[fieldName].possibleValues;

        if ((_.indexOf(possibleValues, fieldData) === -1)) {
            isValid = false;
            errors.push('Given field data for field ' + fieldName + ' is not allowed here: ' + fieldData);
        }
    }

    // Check if value matches input pattern
    if (_.isObject(targetObject[fieldName]) && targetObject[fieldName].pattern) {
        if (fieldData.matches(targetObject[fieldName].pattern) !== true) {
            isValid = false;
            errors.push('Given field data for field ' + fieldName + ' doesn\'t matches the required pattern');
        }
    }

    return {
        isValid: isValid,
        errors: errors
    };
};

ObjectMapper.prototype.map = function(options) {
    var deferred = Q.defer();
    var objectType = options.objectType;

    if (!self.mappings[objectType]) {
        deferred.reject(new Error('Unknown object type given: ' + objectType));
    }

    // Instantitiate object for type
    var classObject = require(process.cwd() + '/' + self.mappings[objectType].path);
    var object      = new classObject();

    var fields = options.requestData.query;
    for (var fieldName in fields) {
        var fieldData = fields[fieldName];

        // Ignore all fields beginning with an underscore
        if (fieldName[0] === '_') continue;

        var validation = self.validate(object, objectType, fieldName, fieldData);
        if (validation.isValid) {
            object[fieldName] = fieldData;
        } else {
            deferred.reject(validation.errors);
        }
    }

    deferred.resolve(object);
    return deferred.promise;
};

ObjectMapper.prototype.middleware = function(req, res, next) {
    if (req.query._objectType) {
        var objectType = req.query._objectType;

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
        }, function(errors){
            console.error('Field validation failed due to:');
            for (var errIndex in errors) {
                console.error('-> ' + errors[errIndex]);
            }

            res.status(500).send('Field validation failed!');
        });
    }
};

module.exports = ObjectMapper;
