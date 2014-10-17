define(['backbone'], function (Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+RecordableCommand, DynamoCore'
        }
    });
});