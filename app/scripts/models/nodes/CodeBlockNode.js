define(['Node', 'FLOOD'], function (Node, FLOOD) {

    return Node.extend({

        defaults: {
            duringUploading: false
        },

        initialize: function (attrs, vals) {
            var inPort = [],
                outPort = [],
                i = 0,
                len = 0;

            if (attrs.duringUploading) {
                this.set('duringUploading', true);
            }
            if (attrs.extra && attrs.extra.inputs) {
                len = attrs.extra.inputs.length;
            }

            for (; i < len; i++) {
                inPort.push(attrs.extra.inputs[i]);
            }

            if (attrs.extra && attrs.extra.outputs) {
                len = attrs.extra.outputs.length;
            } else {
                len = 0;
            }

            for (i = 0; i < len; i++) {
                outPort.push('⇒');
            }

            this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            this.set('creationName', 'Code Block');
            this.set('lastValue', '');
            if (!this.get('failureMessage'))
                this.set('failureMessage', '');
            if (!this.get('extra'))
                this.set('extra',{});
            if (!this.get('displayName'))
                this.set('displayName', '');

            this.initAttrs(attrs, vals);
        },

        updateValue: function (values) {
            var codeBlock = JSON.parse(values.data),
                updated = false;

            if (codeBlock.Code && this.get('extra').code !== codeBlock.Code) {
                this.get('extra').code = codeBlock.Code;
                updated = true;
            }
            if ((!this.get('extra').lineIndices && codeBlock.LineIndices.length > 0)
                || (this.get('extra').lineIndices && !this.get('extra').lineIndices.equals(codeBlock.LineIndices))) {
                this.get('extra').lineIndices = codeBlock.LineIndices;
                updated = true;
            }

            if (!this.get('extra').inputs) {
                this.get('extra').inputs = [];
            }

            if (!this.get('extra').inputs.equals(codeBlock.InPorts)) {
                this.get('extra').inputs = codeBlock.InPorts;
                updated = true;
            }

            if (!this.get('extra').outputs) {
                this.get('extra').outputs = [];
            }

            if (!this.get('extra').outputs.equals(codeBlock.OutPorts)) {
                this.get('extra').outputs = codeBlock.OutPorts;
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
                this.trigger('connections-update');
            }
        }
    });

});