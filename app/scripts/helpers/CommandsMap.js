define( ['CreateNodeCommand', 'DeleteModelCommand', 'MakeConnectionPair', 'RunCancelCommand', 'UpdateModelValueCommand'],
    function ( CreateNodeCommand, DeleteModelCommand, MakeConnectionPair, RunCancelCommand, UpdateModelValueCommand ) {
        return {
            //Key should correspond to the name of command inside flood_runner.js
            addNode: CreateNodeCommand,
            removeNode: DeleteModelCommand,
            removeConnection: DeleteModelCommand,
            addConnection: MakeConnectionPair,
            run: RunCancelCommand,
            updateNode: UpdateModelValueCommand
        };
    });