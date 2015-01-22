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

    UpdateModelValueCommand.syncProperties = function(config, options) {
        var values = [];
        for (var name in options.extra) {
            if (!options.lastValue || (options.lastValue[name] !== options.extra[name])) {

                if (typeMap.hasOwnProperty(options.typeName) && typeMap[options.typeName].param === name) {
                    values.push(getInstance(options._id, typeMap[options.typeName].value, options.extra[name]));
                } else if (name === 'value') {
                    values.push(getInstance(options._id, helpers.capitalizeFirstLetter(name), options.extra[name]));
                }
            }
        }

        // if config.full - send information about ArgumentLacing and UsingDefaultValue 
        if (config.full) {
            values.push(getInstance(options._id, 'ArgumentLacing', getReplicationType(options.replication)));
            values.push(getInstance(options._id, 'UsingDefaultValue', options.ignoreDefaults.join(';')));
        }

        return values;
    };

    var typeMap = {
        'Input': { param: 'name', value: 'InputSymbol' },
        'Output': { param: 'name', value: 'Symbol' },
        'Code Block': { param: 'code', value: 'Code' },
        'Python Script': { param: 'script', value: 'ScriptContent' }
    };

    var getInstance = function (id, name, value) {
        return new UpdateModelValueCommand({}, {
            modelGuid: id,
            name: name,
            value: value
        });
    };

    var getReplicationType = function (replicationType) {
        return replicationTypes[replicationType] || replicationtype.Longest;
    };

    var replicationTypes = {
        //     FLOOD          DYNAMO
        // applyShortest  -  Shortest
        // applyLongest   -  Longest
        // applyCartesian -  CrossProduct
        // applyDisabled  -  Disabled
        applyShortest: 'Shortest',
        applyLongest: 'Longest',
        applyCartesian: 'CrossProduct',
        applyDisabled: 'Disabled'
    };

    return UpdateModelValueCommand;
});