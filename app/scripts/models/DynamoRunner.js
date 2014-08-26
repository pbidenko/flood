define(['AbstractRunner', 'commandsMap', 'RecordableCommandsMessage', 'CreateNodeCommand', 'MakeConnectionCommand', 'UpdateModelValueCommand'],
    function (AbstractRunner, commandsMap, RecordableCommandsMessage, CreateNodeCommand, MakeConnectionCommand, UpdateModelValueCommand) {

    var DynamoRunner =  AbstractRunner.extend({
        initialize: function (attrs, vals) {
            AbstractRunner.prototype.initialize.call(this, attrs, vals);
        },

        postMessage: function (data, quiet) {
            if (commands.hasOwnProperty(data.kind)) {
                this.app.socket.send(commands[data.kind].call(this, data));
            }

            AbstractRunner.prototype.postMessage.call(this, data, quiet);
        },

        reset: function () {
            AbstractRunner.prototype.reset.call(this);
        },

        initWorker: function () {
        }
    });

    var commands = {
        addNode: function (data) {
            return createMessage.call(this, instantiateCommand(data));
        },
        updateNode: function(data){
            return createMessage.call(this, instantiateCommand(data));
        },
        removeNode: function (data) {
            return createMessage.call(this, instantiateCommand(data));
        },
        addConnection: function(data){
            return createMessage.call(this, instantiateCommand(data));
        },
        removeConnection: function(data){
            return createMessage.call(this, instantiateCommand(data));
        },
        setWorkspaceContents: function(data){
            //Create batch of commands to be executed on server
            var i = 0,
                len = data.nodes.length,
                commands = [];
            for( ; i < len; i++ ){
                commands.push(new CreateNodeCommand( {}, data.nodes[i] ));
                Array.prototype.push.apply(commands, new UpdateModelValueCommand( {}, data.nodes[i] ));
            }

            for( i = 0, len = data.connections.length; i < len; i++ ){
                //Leave empty object parameter just for now to be in sync with Backbone models
                 Array.prototype.push.apply(commands, new MakeConnectionCommand({}, data.connections[i]));
            }

            return createMessage.call(this, commands);
        },
        run: function(data){
            return createMessage.call(this, instantiateCommand(data));
        }
    },
    instantiateCommand = function(data){
        return new commandsMap[data.kind]({}, data);
    },
    createMessage = function (commands) {
        //If commands is a single command, make an array from it
        if(!(commands instanceof Array)){
            commands = [commands];
        }

        return JSON.stringify(new RecordableCommandsMessage(commands, this.workspace.get('guid')));
    };

    return DynamoRunner;
});