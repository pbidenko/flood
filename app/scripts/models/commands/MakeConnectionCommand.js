define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    var portModes = {
        begin: 'Begin',
        end: 'End',
        cancel: 'Cancel'
    };
    var portTypes = {
        input: 'INPUT',
        output: 'OUTPUT'
    };

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+MakeConnectionCommand, DynamoCore',
            nodeId: null,
            portIndex: 0,
            portType: 0,
            mode: portModes.begin
        }
    },
        //Static properties
        {
            //Modes enum
            modes: portModes,
            types: portTypes
        });
});