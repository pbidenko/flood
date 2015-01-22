define(['BaseNodeView', 'WatchNodeView', 'NumNodeView', 'ThreeCSGNodeView', 'FormulaView', 'PythonScriptView',
'CodeBlockView', 'OutputView', 'InputView', 'CustomNodeView', 'StringView', 'BooleanView', 'ListCreateView'], 
  function(BaseNodeView, WatchNodeView, NumNodeView, ThreeCSGNodeView, FormulaView, PythonScriptView,
  CodeBlockView, OutputView, InputView, CustomNodeView, StringView, BooleanView, ListCreateView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView,
      'List.Create': ListCreateView,
      'Python Script': PythonScriptView
  };

  nodeViewTypes.Base = ThreeCSGNodeView;
  nodeViewTypes.Show = WatchNodeView;
  nodeViewTypes.Number = NumNodeView;
  nodeViewTypes.CodeBlock = CodeBlockView;
  nodeViewTypes.CustomNode = CustomNodeView;
  nodeViewTypes.Script = FormulaView;
  nodeViewTypes.Input = InputView;
  nodeViewTypes.Output = OutputView;
  nodeViewTypes.String = StringView;
  nodeViewTypes.Boolean = BooleanView;

  return nodeViewTypes;

});