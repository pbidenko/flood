define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+RunCancelCommand, DynamoCore',
            cancelRun: false,
            showErrors: false
        }
    });
});