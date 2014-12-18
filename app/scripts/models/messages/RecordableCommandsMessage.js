define(function(){
    function RecordableCommandsMessage(commands, guid){
        this.type = 'RunCommandsMessage';
        this.Commands = commands || [];
        this.WorkspaceGuid = guid;
    }

    return RecordableCommandsMessage;
});
