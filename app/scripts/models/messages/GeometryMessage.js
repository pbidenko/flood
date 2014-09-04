define(function(){
    function GeometryMessage(nodeId){
        this.$type = 'DynamoWebServer.Messages.GetNodeGeometryMessage, DynamoWebServer';
        this.NodeID = nodeId;
    }

    return GeometryMessage;
});