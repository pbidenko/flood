define(function(){
    function RecordableCommandsMessage(commands, guid){
        this.$type = 'DynamoWebServer.Messages.RecordableCommandsMessage, DynamoCore';
        this.Commands = commands || [];
        this.WorkspaceGuid = guid;
    }

    return RecordableCommandsMessage;
});
