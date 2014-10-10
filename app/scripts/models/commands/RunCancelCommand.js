define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+RunCancelCommand, DynamoCore',
            cancelRun: false,
            showErrors: false
        }
    });
});