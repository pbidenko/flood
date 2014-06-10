define(['MakeConnectionCommand'], function (MakeConnectionCommand) {
    'use strict';

    return Backbone.Collection.extend({
        model: MakeConnectionCommand,

        fromDataObject: function(obj) {
            this.reset();
            var start = new MakeConnectionCommand();
            var end = new MakeConnectionCommand();
            start.set('nodeId', obj.startNodeId);
            start.set('portIndex', obj.startPortIndex);
            start.set('mode', MakeConnectionCommand.modes.begin);
            start.set('portType', MakeConnectionCommand.types.output);

            end.set('nodeId', obj.endNodeId);
            end.set('portIndex', obj.endPortIndex);
            end.set('mode', MakeConnectionCommand.modes.end);
            end.set('portType', MakeConnectionCommand.types.input);
            this.add(start);
            this.add(end);
        }
    });
});