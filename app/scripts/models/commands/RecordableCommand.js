define(['backbone'], function (Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+RecordableCommand, DynamoCore'
        }
    });
});