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
    zeroGuid = '00000000-0000-0000-0000-000000000000',

    MakeConnectionCommand =  RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+MakeConnectionCommand, DynamoCore',
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
        var mode;
        if (data['startPortIndex'] == -1) {
            if (prefix === 'start') {
                return new MakeConnectionCommand({}, {
                    nodeId: zeroGuid,
                    portIndex: -1,
                    portType: portTypes.input,
                    mode: portModes.cancel
                });
            }
            mode = portModes.begin;
        }
        else {
            mode = prefix === nodePrefixes.start ? portModes.begin : portModes.end;
        }

        return new MakeConnectionCommand({}, {
            nodeId: data[prefix+'NodeId'],
            portIndex: data[prefix+'PortIndex'],
            portType: prefix === nodePrefixes.start ? portTypes.output : portTypes.input,
            mode: mode
        });
    };

    return function Connection(config, options){
        if ( options['startPortIndex'] == -1 ) {
            return [
                getInstance( nodePrefixes.end, options ),
                getInstance( nodePrefixes.start, options )
            ];
        }
        else {
            return [
                getInstance( nodePrefixes.start, options ),
                getInstance( nodePrefixes.end, options )
            ];
        }
    }
});