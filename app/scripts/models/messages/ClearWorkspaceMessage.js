/**
 * Created by Masha on 11/14/2014.
 */
define(function(){
    function ClearWorkspaceMessage(onlyHome){
        this.type = 'ClearWorkspaceMessage';
        this.ClearOnlyHome = onlyHome;
    }

    return ClearWorkspaceMessage;
});
