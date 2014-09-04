define(['Node', 'NumberNode', 'CodeBlockNode'], function (Node, NumberNode, CodeBlockNode) {
    var map = {
        'Code Block': CodeBlockNode,
        'Number': NumberNode
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