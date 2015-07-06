var Promise = require('promise');

function ObjectMapper(objectType, requestData) {
    
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

