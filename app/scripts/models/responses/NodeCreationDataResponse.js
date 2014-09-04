define(['backbone'], function (Backbone) {
    function NodeCreationDataResponse(data) {

        this.nodes = data.nodes.map( function(node){
            var returnValue = {
                _id : node._id,
                creatingName : node.creatingName,
                displayedName : node.displayedName,
                position : node.position
            };

            if (node.creatingName === 'Number') {
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