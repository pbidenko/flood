define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    var UpdateModelValueCommand = RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.ViewModels.DynamoViewModel+UpdateModelValueCommand, DynamoCore',
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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    var getInstance = function(id, name, value){
        return new UpdateModelValueCommand({}, {
            modelGuid: id,
            name: name,
            value: value
        });
    };

    return function UpdateModel(config, options){
        var values = [] 
        for(var name in options.extra) {
            if (!options.lastValue || ( options.lastValue[name] != options.extra[name]) ) {
                //Dynamo is only able to handle 'Value' now
                if (name == 'value') {
                    values.push(getInstance(options._id, capitalizeFirstLetter(name), options.extra[name]));
                }
            }
        }
        return values;
    }
});