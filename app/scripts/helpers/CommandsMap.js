define( ['CreateNodeCommand', 'CreateProxyNodeCommand', 'DeleteModelCommand', 'MakeConnectionCommand', 'RunCancelCommand', 'CreateCustomNodeCommand'],
    function ( CreateNodeCommand, CreateProxyNodeCommand, DeleteModelCommand, MakeConnectionCommand, RunCancelCommand, CreateCustomNodeCommand ) {
        return {
            //Key should correspond to the name of command inside flood_runner.js
            addNode: CreateNodeCommand,
            addProxyNode: CreateProxyNodeCommand,
            removeNode: DeleteModelCommand,
            removeConnection: MakeConnectionCommand,
            addConnection: MakeConnectionCommand,
            run: RunCancelCommand,
            addWorkspace: CreateCustomNodeCommand
        };
    });