define(['Node', 'FLOOD'], function (Node, FLOOD) {

    return Node.extend({
        initialize: function (attrs, vals) {
            var inPort,
                outPort;

            var elems = vals.workspace.app.SearchElements.where({ creationName: attrs.typeName });

            if (attrs.extra && attrs.extra.varInputs) {
                inPort = attrs.extra.varInputs;
            }
            else {
                inPort = elems[0].get('inPort');
            }

            outPort = elems[0].get('outPort');

            this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            this.set('displayName', elems[0].get('displayName'));
            this.set('creationName', elems[0].get('creationName'));
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