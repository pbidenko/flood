define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+CreateNodeCommand, DynamoCore',
            nodeId: '00000000-0000-0000-0000-000000000000',
            nodeName: '',
            x: 0,
            y: 0,
            defaultPosition: false,
            transformCoordinates: false
        },

        initialize : function (attr, options) {
            this.set('nodeId', options._id);
            this.set('nodeName', options.typeName);
            this.set('x', options.position[0]);
            this.set('y', options.position[1]);
        }
    });
});