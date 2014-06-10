define(['RecordableCommand', 'staticHelpers'], function (RecordableCommand, staticHelpers) {
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
            //TO DO: Resolve issue with id's (server requires GUID, client int
            this.set('nodeId', staticHelpers.guid());
            this.set('nodeName', options.nodeName);
            this.set('x', options.x);
            this.set('y', options.y);
        }
    });
});