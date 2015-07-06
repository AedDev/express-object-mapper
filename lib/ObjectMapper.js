var Promise = require('promise');

function ObjectMapper(options) {
    this.objectType = options.objectType || undefined;
    this.requestData = options.requestData || undefined; 
}

// Registering looks like ObjectMapper.registerType('MyType', require('./mapping/MyType');
ObjectMapper.prototype.registerType = function(typeName, objectDefinition) {

}

ObjectMapper.prototype.map = function() {
    return new Promise(function(resolve, reject){
        // TODO mapping
    });
};

exports.ObjectMapper = ObjectMapper;
exports.middleware = require('./Middleware');

