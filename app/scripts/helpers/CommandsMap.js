define( ['CreateNodeCommand', 'CreateProxyNodeCommand', 'DeleteModelCommand', 'MakeConnectionCommand', 'RunCancelCommand', 'CreateCustomNodeCommand', 'ModelEventCommand'],
    function ( CreateNodeCommand, CreateProxyNodeCommand, DeleteModelCommand, MakeConnectionCommand, RunCancelCommand, CreateCustomNodeCommand, ModelEventCommand ) {
        return {
            //Key should correspond to the name of command inside flood_runner.js
            addNode: CreateNodeCommand,
            addProxyNode: CreateProxyNodeCommand,
            removeNode: DeleteModelCommand,
            removeConnection: MakeConnectionCommand,
            addConnection: MakeConnectionCommand,
            run: RunCancelCommand,
            addWorkspace: CreateCustomNodeCommand,
            modelEvent: ModelEventCommand
        };
    });