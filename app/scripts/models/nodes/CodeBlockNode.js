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
            this.set('creatingName', 'Code Block');
            this.set('lastValue', '');
            if (!this.get('failureMessage'))
                this.set('failureMessage', '');
            if (!this.get('extra'))
                this.set('extra',{});
            if (!this.get('displayedName'))
                this.set('displayedName', '');

            this.initAttrs(attrs, vals);
        },

        updateValue: function (values) {
            var codeBlock = JSON.parse(values.data),
                updated = false;

            if (codeBlock.Code && this.get('extra').code !== codeBlock.Code) {
                this.get('extra').code = codeBlock.Code;
                updated = true;
            }

            if (!this.get('extra').portIndexes) {
                this.get('extra').portIndexes = [];
            }

            if (!this.get('extra').portIndexes.equals(codeBlock.PortIndexes)) {
                this.get('extra').portIndexes = codeBlock.PortIndexes;
                updated = true;
            }
            if (!this.get('extra').inputs) {
                this.get('extra').inputs = [];
            }

            if (!this.get('extra').inputs.equals(codeBlock.InPorts)) {

                this.get('extra').inputs = codeBlock.InPorts;
                updated = true;
            }                this.get('extra').inputs = codeBlock.InPorts;
                updated = true;
            }

            if (!this.get('extra').outputs) {
                this.get('extra').outputs = [];
            }

            if (!this.get('extra').outputs.equals(codeBlock.OutPorts)) {
                this.get('extra').outputs = codeBlock.OutPorts;
                updated = true;
            }

            if (values.state !== 'Active') {
                if (this.get('failureMessage') !== values.stateMessage) {
                    this.set('failureMessage', values.stateMessage);
                }
            }
            else if (this.get('failureMessage') !== '') {
                this.set('failureMessage', '');
            }

            if (updated) {
                this.trigger('connections-update');
            }
        }
    });

});