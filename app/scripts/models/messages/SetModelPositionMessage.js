/**
 * Created by Masha on 11/4/2014.
 */
define(function(){
    function SetModelPositionMessage(nodePositions, guid, name){
        this.type = 'SetModelPositionMessage';
        this.ModelPositions = nodePositions || [];
        this.WorkspaceGuid = guid;
        this.WorkspaceName = name;
    }

    return SetModelPositionMessage;
});
