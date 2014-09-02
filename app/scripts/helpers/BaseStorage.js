define(['backbone', 'staticHelpers'], function(Backbone, helpers) {

  var workspace = {
    name: 'New workspace',
    _id: '00000000-0000-0000-0000-000000000000',
    guid: '00000000-0000-0000-0000-000000000000',
    nodes: [],
    connections: [],
    isCustomNode: false
  },

  session = {
    __v: 0,
    _id: "540429880879db500f0f2be8",
    isFirstExperience: true,
    name: "Empty session",
    workspaces: []
  },

  createPromise = function(result) {
    var deferred = $.Deferred();

    if (result) deferred.resolve(result);

    return deferred.promise();
  };

  return {
  
    createNewWorkspace: function() {
      var nws = $.extend({}, workspace, { _id: helpers.guid() });
      session.workspaces.push(nws);
      return createPromise(nws);
    },

    createNewNodeWorkspace: function() {
      var nws = $.extend({}, workspace, { _id: helpers.guid(), guid: helpers.guid(), isCustomNode: true });
      session.workspaces.push(nws);
      return createPromise(nws);
    },

    loadWorkspace: function(id) {

      return createPromise($.extend({}, workspace, { _id: helpers.guid() }));
    },

    fetchLogin: function() {

      return createPromise({ email: 'default' });
    },

    logout: function() {

      return createPromise();
    },

    fetchWorkspaces: function() {
      var nws = $.extend({}, workspace, { _id: helpers.guid() });
      session.workspaces.push(nws);
      return createPromise($.extend({}, session));
    },

    fetchWorkspaceBrowserElements: function() {

      var arr = [];

      session.workspaces.map(function(ws) {
        arr.push({
          _id: ws._id,
          name: ws.name,
          isCustomNode: ws.isCustomNode,
          isPublic: false,
          lastSaved: new Date().toISOString(),
          isModified: false,
          maintainers: []
        });
      });

      return createPromise(arr);
    },

    syncWorkspace: function(method, model, options) {
      session.workspaces.map(function(ws) {
        if (ws._id === model.get('_id'))
          ws.name = model.get('name');
      });
      return true;
    }

  };
});
