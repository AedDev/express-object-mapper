function ObjectMapperMiddleware(req, res, next) {
    if (req.query.objectType) {
        var objectType = req.query.objectType;

        // Instantiate new ObjectMapper targeting on given type
        var ObjectMapper = require('./ObjectMapper').ObjectMapper;

        // Build and map new data object based on given data
        var dataObject = new ObjectMapper({
            objectType: objectType,
            requestData: req
        }).map().then(function(mappedObject){
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
        });
    }


    // Move on
    next();
};

