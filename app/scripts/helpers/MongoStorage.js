define(['backbone', 'helpers/BaseStorage', 'settings'], function (Backbone, BaseStorage, settings) {

    var mongoStorage = Object.create(BaseStorage),
        //Create local variable with url just to release settings object so it can be garbage collected
        baseUrl = settings.storageUrl,
        createUrl = function (url) {
            return baseUrl + url;
        };

    mongoStorage = {
        createNewWorkspace: function () {

            return $.get(createUrl('/nws'));
        },

        createNewNodeWorkspace: function () {

            return $.get(createUrl('/nws'));
        },

        loadWorkspace: function (id) {

            return $.get(createUrl('/ws/' + id));
        },

        fetchLogin: function () {

            return $.get(createUrl('/email'));
        },

        logout: function () {

            return $.get(createUrl('/logout'));
        },

        fetchWorkspaces: function () {

            return $.get(createUrl('/mys'));
        },

        fetchWorkspaceBrowserElements: function () {

            return $.get(createUrl('/ws'));
        },

        syncWorkspace: function (method, model, options) {
            return Backbone.sync(method, model, options);
        }
    };

    return mongoStorage;
});