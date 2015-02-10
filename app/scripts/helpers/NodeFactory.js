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
        create: function(settings) {
            var ctr;
            if (map.hasOwnProperty(settings.config.typeName)) {
                ctr = map[settings.config.typeName];
            } else {
                ctr = Node;
            }

            var options = {};
            var elements = settings.searchElements.where({ creationName: settings.config.typeName });
            if (elements.length) {
                options.searchElement = elements[0];
            }

            return new ctr(settings.config, options);
        }
    }
});
