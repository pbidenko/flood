define(['Node', 'NumberNode', 'CodeBlockNode', 'StringNode', 'BooleanNode', 'ListNode'], 
function (Node, NumberNode, CodeBlockNode, StringNode, BooleanNode, ListNode) {
    var map = {
        'Code Block': CodeBlockNode,
        'Number': NumberNode,
        'String' : StringNode,
        'Boolean' : BooleanNode,
        'List.Create': ListNode
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
