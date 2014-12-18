define(function(){
    function GeometryMessage(nodeId){
        this.type = 'GetNodeGeometryMessage';
        this.NodeId = nodeId;
    }

    return GeometryMessage;
});