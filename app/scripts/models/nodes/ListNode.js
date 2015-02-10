define(['Node', 'FLOOD'], function (Node, FLOOD) {

    return Node.extend({
        initialize: function (attrs, vals) {
            var inPort,
                outPort;

            if (attrs.extra && attrs.extra.varInputs) {
                inPort = attrs.extra.varInputs;
            }
            else if (vals.searchElement) {
                inPort = vals.searchElement.get('inPort');
            }

            if (vals.searchElement) {
                outPort = vals.searchElement.get('outPort');
                this.set('displayName', vals.searchElement.get('displayName'));
                this.set('creationName', vals.searchElement.get('creationName'));
            }

            this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            this.set('lastValue', '');
            if (!this.get('failureMessage'))
                this.set('failureMessage', '');
            if (!this.get('extra'))
                this.set('extra', {});
            if (!this.get('displayName'))
                this.set('displayName', '');

            this.initAttrs(attrs, vals);
        }
    });
});