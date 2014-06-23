define(function(){
    function Message(commands){
        this.$type = 'Dynamo.Messages.Message, DynamoCore';
        this.commands = commands || [];
    }

    return Message;
});
