define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+ModelEventCommand, DynamoCore',
            modelGuid: '00000000-0000-0000-0000-000000000000',
            eventName: ''
        }
    });
});