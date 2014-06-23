define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+UpdateModelValueCommand, DynamoCore',
            modelGuid: '00000000-0000-0000-0000-000000000000',
            name: 'lastValue',
            value: null
        },

        initialize : function (attr, options) {
            this.set('modelGuid', options._id);
            var lastValueObj = options.newValue;
            for(var name in lastValueObj) {
                this.set('name', name);
                this.set('value', lastValueObj[name]);
            }
        }
    });
});