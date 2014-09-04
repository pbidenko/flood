define(function(){
    function RecordableCommandsMessage(commands, guid){
        this.$type = 'DynamoWebServer.Messages.RunCommandsMessage, DynamoWebServer';
        this.Commands = commands || [];
        this.WorkspaceGuid = guid;
    }

    return RecordableCommandsMessage;
});
