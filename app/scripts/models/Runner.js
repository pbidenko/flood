define(['backbone'], function (Backbone) {

    return Backbone.Model.extend({

        defaults: {
            isRunning: false
        },

        initialize: function (atts, vals) {

            this.app = vals.app;
            var ws = vals.workspace;
            this.workspace = ws;

            this.set('id', ws.get('_id'));

            this.reset();

            vals.workspace.get('connections').on('add', this.addConnection, this);
            vals.workspace.get('connections').on('remove', this.removeConnection, this);

            vals.workspace.get('nodes').on('add', this.addNode, this);
            vals.workspace.get('nodes').on('remove', this.removeNode, this);

            this.runCount = 0;
            this.averageRunTime = 0;

        },

        postMessage: function(data, quiet) {

            if (quiet) return;

            this.trigger('post', data);
        },

        post: function (data, quiet) {

            data.workspace_id = this.workspace.get('_id');
            this.postMessage(data, quiet);

        },

        initWorkspace: function () {

            this.post({ kind: 'addWorkspace' });

            var wsc = this.workspace.toJSON();
            var ncb = function () { this.updateNode(node); };

            var that = this;
            this.workspace.get('nodes').each(function (x) {
                that.watchNodeEvents.call(that, x);
            });

            wsc.kind = "setWorkspaceContents";
            this.post(wsc);
        },

        on_nodeEvalComplete: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                node.onEvalComplete(data.isNew, data.value, data.prettyValue);

        },

        on_nodeEvalFailed: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                this.workspace.get('nodes').get(data._id).onEvalFailed(data.exception);
        },

        on_nodeEvalBegin: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                this.workspace.get('nodes').get(data._id).onEvalBegin(data.isNew);

        },

        on_run: function (data) {

            console.log(data);
            this.set('isRunning', false);
            this.runCount++;

        },

        cancel: function () {

            this.set('isRunning', false);
            this.reset();

        },

        runQueued: false,

        run: _.throttle(function (bottomIds) {

            this.post({ kind: "run", bottom_ids: bottomIds });
            this.set('isRunning', true);

        }, 120),

        watchNodeEvents: function (node) {

            var u = function () { this.updateNode(node); };
            node.on('change:replication', u, this);
            node.on('change:ignoreDefaults', u, this);
            node.on('updateRunner', u, this);

        },

        updateNode: function (node) {

            var n = node.serialize();
            n.kind = "updateNode";

            this.post(n);

        },

        addNode: function (node) {

            var n = node.serialize();
            n.kind = "addNode";
            this.watchNodeEvents(node);

            this.post(n);

        },

        removeNode: function (node) {

            var n = node.serialize();
            n.kind = "removeNode";
            this.post(n);

        },

        addConnection: function (connection) {

            var c = connection.toJSON();
            c.kind = "addConnection";
            c.id = connection.get('_id');

            this.post(c);

        },

        removeConnection: function (connection) {

            var c = connection.toJSON();
            c.kind = "removeConnection";
            c.id = connection.get('endNodeId');
            c.portIndex = connection.get('endPortIndex');

            this.post(c);

        },

        reset: function () {
            this.initWorkspace();
        }

    });
});