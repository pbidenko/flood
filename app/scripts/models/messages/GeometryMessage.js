define(function(){
    function GeometryMessage(nodeId){
        this.$type = 'DynamoWebServer.Messages.GetNodeGeometryMessage, DynamoWebServer';
        this.NodeId = nodeId;
    }

    return GeometryMessage;
});