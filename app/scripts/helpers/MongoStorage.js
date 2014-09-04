define(['backbone', 'helpers/BaseStorage'], function(Backbone, BaseStorage) {

  var mongoStorage = {

    createNewWorkspace: function() {

      return $.get('/nws');
    },

    createNewNodeWorkspace: function() {

      return $.get('/nws');
    },

    loadWorkspace: function(id) {

      return $.get('/ws/' + id);
    },

    fetchLogin: function() {

      return $.get('/email');
    },

    logout: function() {

      return $.get('/logout');
    },

    fetchWorkspaces: function() {

      return $.get('/mys');
    },

    fetchWorkspaceBrowserElements: function() {

      return $.get('/ws');
    },

    syncWorkspace: function(method, model, options) {
      return Backbone.sync(method, model, options);
    }

  };

  mongoStorage.prototype = BaseStorage;
  return mongoStorage;
});