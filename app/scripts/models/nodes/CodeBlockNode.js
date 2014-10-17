define(['Node', 'FLOOD'], function (Node, FLOOD) {

    return Node.extend({

        initialize: function (attrs, vals) {
            var inPort = [],
                outPort = [],
                i = 0,
                len = 0;

            if (attrs.extra && attrs.extra.inputs) {
                len = attrs.extra.inputs.length;
                attrs.extra.oldInputs = attrs.extra.inputs;
            }

            for (; i < len; i++) {
                inPort.push(attrs.extra.inputs[i]);
            }

            if (attrs.extra && attrs.extra.outputs) {
                len = attrs.extra.outputs.length;
                attrs.extra.oldOutputs = attrs.extra.outputs;
            } else {
                len = 0;
            }

            for (i = 0; i < len; i++) {
                outPort.push('⇒');
            }

            this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            this.set('creationName', 'Code Block');
            this.set('lastValue', '');

            this.initAttrs(attrs, vals);
        },

        updateValue: function (values) {
            var codeBlock = JSON.parse(values.data),
                updated = false,
                extraCopy = JSON.parse(JSON.stringify( this.get('extra')));

            if (codeBlock.Code && extraCopy.code !== codeBlock.Code) {
                extraCopy.code = codeBlock.Code;
                updated = true;
            }

            if ((!extraCopy.lineIndices && codeBlock.LineIndices.length) 
                || (extraCopy.lineIndices && !extraCopy.lineIndices.equals(codeBlock.LineIndices))) {
                extraCopy.lineIndices = codeBlock.LineIndices;
                updated = true;
            }

            if(!extraCopy.inputs) {
                extraCopy.oldInputs = [];
                extraCopy.inputs = [];
            }

            if (!extraCopy.inputs.equals(codeBlock.InPorts)) {
                extraCopy.oldInputs = extraCopy.inputs;
                extraCopy.inputs = codeBlock.InPorts;
                updated = true;
            }

            if (!extraCopy.outputs) {
                extraCopy.oldOutputs = [];
                extraCopy.outputs = [];
            }

            if (!extraCopy.outputs.equals(codeBlock.OutPorts)) {
                extraCopy.oldOutputs = extraCopy.outputs;
                extraCopy.outputs = codeBlock.OutPorts;
                updated = true;
            }

            if (values.state === 'Error' || values.state === 'Warning') {
                this.trigger('evalFailed', values.stateMessage);
            }
            else {
                this.set('failureMessage', '');
                this.trigger('evalBegin');
            }

            if (updated) {
                this.set('extra', extraCopy);
                this.trigger('connections-update');
            }
            else {
                this.trigger('cbn-up-to-date');
            }
        }
    });

});