define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+CreateNodeCommand, DynamoCore',
            nodeId: '00000000-0000-0000-0000-000000000000',
            nodeName: '',
            x: 0,
            y: 0,
            defaultPosition: true,
            transformCoordinates: false
        },

        initialize : function (attr, options) {
            this.set('nodeId', options._id);
            this.set('nodeName', options.nodeName);
            this.set('x', options.x);
            this.set('y', options.y);
        }
    });
});