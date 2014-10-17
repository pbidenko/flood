define( ['CreateNodeCommand', 'DeleteModelCommand', 'MakeConnectionCommand', 'RunCancelCommand', 'UpdateModelValueCommand', 'CreateCustomNodeCommand'],
    function ( CreateNodeCommand, DeleteModelCommand, MakeConnectionCommand, RunCancelCommand, UpdateModelValueCommand, CreateCustomNodeCommand ) {
        return {
            //Key should correspond to the name of command inside flood_runner.js
            addNode: CreateNodeCommand,
            removeNode: DeleteModelCommand,
            removeConnection: MakeConnectionCommand,
            addConnection: MakeConnectionCommand,
            run: RunCancelCommand,
            updateNode: UpdateModelValueCommand,
            addWorkspace: CreateCustomNodeCommand
        };
    });