define(['backbone'], function (Backbone) {
    function NodeCreationDataResponse(data) {

        this.nodes = data.nodes.map( function(node){
            var returnValue = {
                _id : node._id,
                creationName : node.creationName,
                displayName : node.displayName,
                position : node.position
            };

            if (node.creationName === 'Number') {
                returnValue.extra = { value: node.value };
            }

            return returnValue;
        });

        this.connections = data.connections.map( function(connection){
            delete connection.$type;
            return connection;
        });

        this.result = data.nodesResult;
    }

    return NodeCreationDataResponse;
});