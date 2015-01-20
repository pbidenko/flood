define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+ModelEventCommand, DynamoCore',
            modelGuid: '00000000-0000-0000-0000-000000000000',
            eventName: ''
        },

        initialize : function (attr, options) {
            this.set('modelGuid', options._id);
            this.set('eventName', options.eventName);
        }
    });
});