/**
 * Created by Masha on 11/14/2014.
 */
define(function(){
    function ClearWorkspaceMessage(onlyHome){
        this.$type = 'DynamoWebServer.Messages.ClearWorkspaceMessage, DynamoWebServer';
        this.ClearOnlyHome = onlyHome;
    }

    return ClearWorkspaceMessage;
});
