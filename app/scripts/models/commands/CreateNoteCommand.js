define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+CreateNoteCommand, DynamoCore',
            nodeId: '00000000-0000-0000-0000-000000000000',
            nodeName: '',
            x: 0,
            y: 0,
            defaultPosition: true
        }
    });
});