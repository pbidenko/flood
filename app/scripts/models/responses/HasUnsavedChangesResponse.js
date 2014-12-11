/**
 * Created by Masha on 11/13/2014.
 */
define(['backbone'], function (Backbone) {
    function HasUnsavedChangesResponse(data) {
        this.guid = data.guid;
        this.hasUnsavedChanges = data.hasUnsavedChanges;
    }

    return HasUnsavedChangesResponse;
});
