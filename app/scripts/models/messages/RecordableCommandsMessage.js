define(function(){
    function RecordableCommandsMessage(commands){
        this.$type = 'Dynamo.Messages.RecordableCommandsMessage, DynamoCore';
        this.Commands = commands || [];
    }

    return RecordableCommandsMessage;
});
