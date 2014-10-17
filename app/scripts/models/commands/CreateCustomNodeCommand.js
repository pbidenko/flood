define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+CreateCustomNodeCommand, DynamoCore',
            nodeId: '00000000-0000-0000-0000-000000000000',
            name: '',
            category: 'Builtin Functions',
            description: '',
            makeCurrent: false
        },

        initialize : function (attr, options) {
            this.set('nodeId', options.guid);
            this.set('name', options.name);
        }
    });
});