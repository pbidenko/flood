define(['Node', 'NumberNode', 'CodeBlockNode', 'BooleanNode'], 
function (Node, NumberNode, CodeBlockNode, BooleanNode) {
    var map = {
        'Code Block': CodeBlockNode,
        'Number': NumberNode,
        'BooleanNode' : BooleanNode
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