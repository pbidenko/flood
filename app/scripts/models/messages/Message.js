define(function(){
    function Message(commands, guid){
        this.$type = 'Dynamo.Messages.Message, DynamoCore';
        this.commands = commands || [];
		this.WorkspaceGuid = guid;
    }

    return Message;
});
