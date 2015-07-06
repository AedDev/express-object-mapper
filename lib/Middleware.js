function ObjectMapperMiddleware(mapper) {
    if (!mapper instanceof ObjectMapper) throw new Error('ObjectMapperMiddleware requires a ObjectMapper object');

    this.mapper = mapper;
}

ObjectMapperMiddleware.prototype.middleware = function(req, res, next) {
    if (req.query.objectType) {
        var objectType = req.query.objectType;

        // Build and map new data object based on given data
        this.mapper.map({
            objectType: objectType,
            requestData: req
        }).then(function(mappedObject){
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
        }).catch(function(error){
            throw error;
        }).done(function(){
            next();
        });
    }
};

module.exports = ObjectMapperMiddleware;

