define(['Node', 'NumberNode', 'CodeBlockNode', 'StringNode'], 
function (Node, NumberNode, CodeBlockNode, StringNode) {
    var map = {
        'Code Block': CodeBlockNode,
        'Number': NumberNode,
        'String' : StringNode
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