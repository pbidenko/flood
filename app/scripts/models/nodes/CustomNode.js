define(['Node', 'FLOOD'], function (Node, FLOOD) {

    return Node.extend({

        initialize: function (attrs, vals) {
            var inPort = [],
                outPort = [],
                i = 0,
                len = 0;

            if (attrs.extra.inputs) {
                len = attrs.extra.inputs.length;
            }
            for (; i < len; i++) {
                inPort.push(attrs.extra.inputs[i]);
            }

            if (attrs.extra.outputs) {
                len = attrs.extra.outputs.length;
            } else {
                len = 0;
            }
            for (i = 0; i < len; i++) {
                outPort.push('⇒');
            }

            this.set('creatingName', attrs.extra.guid);
            this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));

            this.initAttrs(attrs, vals);
        }

    });

});