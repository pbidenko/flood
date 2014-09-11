define(['backbone', 'helpers/BaseStorage', 'settings'], function (Backbone, BaseStorage, settings) {

    var createUrl = function (url) {
        return this.baseUrl + url;
    };

    function MongoStorage(options) {

        BaseStorage.apply(this, arguments);
    }

    MongoStorage.prototype = Object.create(BaseStorage.prototype);

    MongoStorage.prototype.createNewWorkspace = function () {

        return $.get(createUrl('/nws'));
    };

    MongoStorage.prototype.createNewNodeWorkspace = function () {

        return $.get(createUrl('/nws'));
    };

    MongoStorage.prototype.loadWorkspace = function (id) {

        return $.get(createUrl('/ws/' + id));
    };

    MongoStorage.prototype.fetchLogin = function () {

        return $.get(createUrl('/email'));
    };

    MongoStorage.prototype.logout = function () {

        return $.get(createUrl('/logout'));
    };

    MongoStorage.prototype.fetchWorkspaces = function () {

        return $.get(createUrl('/mys'));
    };

    MongoStorage.prototype.fetchWorkspaceBrowserElements = function () {

        return $.get(createUrl('/ws'));
    };

    MongoStorage.prototype.syncWorkspace = function (method, model, options) {
        return Backbone.sync(method, model, options);
    };

    return MongoStorage;
});