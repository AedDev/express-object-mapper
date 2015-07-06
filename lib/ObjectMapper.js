var Promise = require('promise');

function ObjectMapper() {
    // Predefine empty mappings object
    this.mappings = {};
}

ObjectMapper.prototype.config = function(options) {
    if (!options) throw new Error('No options provided');

    // Path given, try to require
    if (typeof(options.mappings) === 'string') {
        this.mappings = require(options.mappings);
    // Configuration object given
    } else if (typeof(options.mappings) === 'object') {
        this.mappings = options.mappings;
    }
};

ObjectMapper.prototype.map = function(objectType, requestData) {
    return new Promise(function(resolve, reject){
        if (!this.mappings[objectType]) throw new Error('Unknown object type given: ' + objectType);

        // TODO Map object
    });
};

exports.ObjectMapper = ObjectMapper;
exports.middleware = require('./Middleware')(mapper);

