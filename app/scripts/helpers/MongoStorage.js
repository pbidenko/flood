define(['backbone', 'helpers/BaseStorage', 'settings'], function (Backbone, BaseStorage, settings) {

    var mongoStorage = Object.create(BaseStorage),
        //Create local variable with url just to release settings object so it can be garbage collected
        baseUrl = settings.storageUrl,
        createUrl = function (url) {
            return baseUrl + url;
        };

    mongoStorage.createNewWorkspace = function () {

        return $.get(createUrl('/nws'));
    };

    mongoStorage.createNewNodeWorkspace = function () {

        return $.get(createUrl('/nws'));
    };

    mongoStorage.loadWorkspace = function (id) {

        return $.get(createUrl('/ws/' + id));
    };

    mongoStorage.fetchLogin = function () {

        return $.get(createUrl('/email'));
    };

    mongoStorage.logout = function () {

        return $.get(createUrl('/logout'));
    };

    mongoStorage.fetchWorkspaces = function () {

        return $.get(createUrl('/mys'));
    };

    mongoStorage.fetchWorkspaceBrowserElements = function () {

        return $.get(createUrl('/ws'));
    };

    mongoStorage.syncWorkspace = function (method, model, options) {
        return Backbone.sync(method, model, options);
    };

    return mongoStorage;
});