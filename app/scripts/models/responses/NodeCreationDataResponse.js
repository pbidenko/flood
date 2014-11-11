define(['backbone', 'staticHelpers'], function (Backbone, staticHelpers) {
    function NodeCreationDataResponse(data) {
        this.workspaceId = data.workspaceId;
        this.workspaceName = data.workspaceName;
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
            else if (node.value){

                var codeBlock = JSON.parse(node.value);
                returnValue.extra = codeBlock;

                if (codeBlock.Code)
                    returnValue.extra.code = codeBlock.Code;

                returnValue.extra.inputs = codeBlock.InPorts;
                returnValue.extra.outputs = codeBlock.OutPorts;

                if (codeBlock.LineIndices) {
                    returnValue.extra.lineIndices = codeBlock.LineIndices;
                }

                if (node.isCustomNode) {
                    returnValue.isCustomNode = true;
                    returnValue.extra.creationName = node.creationName;
                    returnValue.creationName = "CustomNode";
                    returnValue.extra.functionName = node.displayName;
                    returnValue.extra.displayName = node.displayName;
                    returnValue.extra.numInputs = codeBlock.InPorts.length;
                    returnValue.extra.numOutputs = codeBlock.OutPorts.length;
                }
            }

            return returnValue;
        });

        this.connections = data.connections.map( function(connection){
            delete connection.$type;
            return connection;
        });

        this.result = data.nodesResult || [];
    }

    return NodeCreationDataResponse;
});