/**
 * Created by Masha on 11/13/2014.
 */
define(function(){
    function HasUnsavedChangesMessage(guid){
        this.type = 'HasUnsavedChangesMessage';
        this.WorkspaceGuid = guid;
    }

    return HasUnsavedChangesMessage;
});
