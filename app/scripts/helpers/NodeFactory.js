define(['Node', 'NumberNode', 'CodeBlockNode', 'StringNode', 'BooleanNode', 'VariableInputNode', 'PythonScriptNode'], 
function (Node, NumberNode, CodeBlockNode, StringNode, BooleanNode, VariableInputNode, PythonScriptNode) {
    var map = {
        'Code Block': CodeBlockNode,
        'Number': NumberNode,
        'String' : StringNode,
        'Boolean' : BooleanNode,
        'List.Create': VariableInputNode,
        'Python Script': PythonScriptNode
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
