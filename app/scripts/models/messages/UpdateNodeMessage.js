define(function(){
    function UpdateNodeMessage(nodeId, parameterName, parameterValue, workspaceId) {
        this.$type = 'DynamoWebServer.Messages.UpdateNodeMessage, DynamoWebServer';
        this.NodeId = nodeId;
        this.ParameterName = parameterName;
        this.ParameterValue = parameterValue;
        this.WorkspaceGuid = workspaceId;
    }

    return UpdateNodeMessage;
});