define(['RecordableCommand', 'staticHelpers'], function (RecordableCommand, helpers) {
    'use strict';

    var UpdateModelValueCommand = RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+UpdateModelValueCommand, DynamoCore',
            modelGuid: '00000000-0000-0000-0000-000000000000',
            name: '',
            value: null
        },

        initialize : function (attr, options) {
            this.set('modelGuid', options.modelGuid);
            this.set('name', options.name);
            this.set('value', options.value);

        }
    });

    var typeMap = {
        'Input': {param: 'name', value: 'InputSymbol'},
        'Output': {param: 'name', value: 'Symbol'},
        'Code Block': {param: 'code', value: 'Code'},
        'Replication': {param: 'Replication', value: 'ArgumentLacing'},
        'IgnoreDefaults': {param: 'IgnoreDefaults', value: 'UsingDefaultValue'}
    };

    var getInstance = function(id, name, value){
        return new UpdateModelValueCommand({}, {
            modelGuid: id,
            name: name,
            value: value
        });
    };

    return function UpdateModel(config, options){
        var values = [];
        for(var name in options.extra) {
            if (!options.lastValue || ( options.lastValue[name] !== options.extra[name]) ) {

                if (typeMap.hasOwnProperty(options.typeName) && typeMap[options.typeName].param === name) {
                    values.push(getInstance(options._id, typeMap[options.typeName].value, options.extra[name]));
                }
                else if (name === 'value') {
                    values.push(getInstance(options._id, helpers.capitalizeFirstLetter(name), options.extra[name]));
                }
            }
        }
        return values;
    }
});