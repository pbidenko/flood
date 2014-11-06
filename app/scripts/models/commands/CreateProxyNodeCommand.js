/**
 * Created by Masha on 8/21/2014.
 */
define(['RecordableCommand'], function (RecordableCommand) {
    'use strict';

    return RecordableCommand.extend({
        defaults: {
            $type: 'Dynamo.Models.DynamoModel+CreateProxyNodeCommand, DynamoCore',
            nodeId: '00000000-0000-0000-0000-000000000000',
            nodeName: '',
            x: 0,
            y: 0,
            defaultPosition: false,
            transformCoordinates: false,
            nickName: '',
            inputs: 0,
            outputs: 0
        },

        initialize : function (attr, options) {
            this.set('nodeId', options._id);
            this.set('nodeName', options.creationName);
            this.set('x', options.position[0]);
            this.set('y', options.position[1]);
            this.set('nickName', options.extra.functionName);
            this.set('inputs', options.extra.inputs.length);
            this.set('outputs', options.extra.outputs.length);
        }
    });
});