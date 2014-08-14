define(['Node', 'CustomNode'], function (Node, CustomNode) {
    var map = {
        'CustomNode': CustomNode
    };

    return {
        create: function(settings){
            var ctr;
            if (map.hasOwnProperty(settings.config.typeName)) {
                ctr = map[settings.config.typeName];
            } else {
                ctr = Node;
            }

            return new ctr(settings.config, { workspace: settings.workspace });
        }
    }
});