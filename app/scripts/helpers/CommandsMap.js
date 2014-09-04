define( ['CreateNodeCommand', 'DeleteModelCommand', 'MakeConnectionCommand', 'RunCancelCommand', 'UpdateModelValueCommand'],
    function ( CreateNodeCommand, DeleteModelCommand, MakeConnectionCommand, RunCancelCommand, UpdateModelValueCommand ) {
        return {
            //Key should correspond to the name of command inside flood_runner.js
            addNode: CreateNodeCommand,
            removeNode: DeleteModelCommand,
            removeConnection: MakeConnectionCommand,
            addConnection: MakeConnectionCommand,
            run: RunCancelCommand,
            updateNode: UpdateModelValueCommand            
        };
    });