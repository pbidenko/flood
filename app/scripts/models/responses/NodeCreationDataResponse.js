define(['backbone', 'staticHelpers'], function (Backbone, staticHelpers) {
    var inputNodeNames = ['Number', 'String', 'Boolean'];
    var inputOutputNodesNames = ['Input', 'Output'];

    function mapNode (node) {
        var returnValue = {
            _id : node._id,
            creationName : node.creationName,
            displayName : node.displayName,
            position : node.position
        };

        if (inputNodeNames.indexOf(node.creationName) > -1) {
            returnValue.extra = { value: node.value };
        }
        else if (inputOutputNodesNames.indexOf(node.creationName) > -1) {
            returnValue.extra = { name: node.value };
        }
        else if (node.value){
            var data = JSON.parse(node.value);
            returnValue.extra = data;

            if (data.Code) {
                returnValue.extra.code = data.Code;
            }

            returnValue.extra.inputs = data.InPorts;
            returnValue.extra.outputs = data.OutPorts;

            if (data.LineIndices) {
                returnValue.extra.lineIndices = data.LineIndices;
            }

            if (node.isCustomNode) {
                returnValue.isCustomNode = true;
                returnValue.extra.creationName = node.creationName;
                returnValue.creationName = "CustomNode";
                returnValue.extra.functionName = node.displayName;
                returnValue.extra.displayName = node.displayName;
                returnValue.extra.numInputs = data.InPorts.length;
                returnValue.extra.numOutputs = data.OutPorts.length;
            }
        }

        return returnValue;
    }

    function NodeCreationDataResponse(data) {
        this.workspaceId = data.workspaceId;
        this.workspaceName = data.workspaceName;
        this.nodes = data.nodes.map(mapNode);

        this.connections = data.connections.map(function (connection) {
            delete connection.$type;
            return connection;
        });

        this.result = data.nodesResult || [];
    }

    return NodeCreationDataResponse;
});