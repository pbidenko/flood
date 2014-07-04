define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    var portModes = {
        begin: 'Begin',
        end: 'End',
        cancel: 'Cancel'
    },
    nodePrefixes = {
        start: 'start',
        end: 'end'
    },
    portTypes = {
        input: 'INPUT',
        output: 'OUTPUT'
    },

    MakeConnectionCommand =  RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+MakeConnectionCommand, DynamoCore',
            nodeId: null,
            portIndex: 0,
            portType: 0,
            mode: portModes.begin
        },

        initialize : function (attr, options) {
            this.set('nodeId', options.nodeId);
            this.set('portIndex', options.portIndex);
            this.set('portType', options.portType);
            this.set('mode', options.mode);
        }
    },
        //Static properties
        {
            //Modes enum
            modes: portModes,
            types: portTypes
    }),

    getInstance = function(prefix, data){
        return new MakeConnectionCommand({}, {
            nodeId: data[prefix+'NodeId'],
            portIndex: data[prefix+'PortIndex'],
            portType: prefix === nodePrefixes.start ? portTypes.output : portTypes.input,
            mode: prefix === nodePrefixes.start ? portModes.begin : portModes.end
        });
    };

    return function Connection(config, options){
        return [
            getInstance(nodePrefixes.start, options),
            getInstance(nodePrefixes.end, options)
        ]
    }
});