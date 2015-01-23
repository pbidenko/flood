define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({

    idAttribute: "_id",

    defaults: {
      startNodeId: 0
      , endNodeId: 0
      , startPortIndex: 0
      , endPortIndex: 0
      , startProxy: false
      , endProxy: false
      , startProxyPosition: [0,0]
      , endProxyPosition: [0,0]
      , hidden: false
    },

    startNode: null,
    endNode: null,

    initialize: function(args, options) {

        if (!args.startProxy && !args.endProxy) {
            // bind to end nodes
            this.startNode = options.startNode;
            this.endNode = options.endNode;
        }
    },

    getOpposite: function(startNode){

      if ( startNode === this.startNode )
      {
        return {node: this.endNode, portIndex: this.get('endPortIndex')};
      }

      if ( startNode === this.endNode )
      {
        return {node: this.startNode, portIndex: this.get('startPortIndex')};
      }

      return {};

    }

  });

});
