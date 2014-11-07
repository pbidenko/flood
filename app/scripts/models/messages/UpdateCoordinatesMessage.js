/**
 * Created by Masha on 11/4/2014.
 */
define(function(){
    function UpdateCoordinatesMessage(nodePositions, guid, name){
        this.$type = 'DynamoWebServer.Messages.UpdateCoordinatesMessage, DynamoWebServer';
        this.NodePositions = nodePositions || [];
        this.WorkspaceGuid = guid;
        this.WorkspaceName = name;
    }

    return UpdateCoordinatesMessage;
});
