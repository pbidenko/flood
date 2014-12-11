define(['BaseNodeView', 'WatchNodeView', 'NumNodeView', 'ThreeCSGNodeView', 'FormulaView',
        'CodeBlockView', 'OutputView', 'InputView', 'CustomNodeView', 'BooleanView'],
  function(BaseNodeView, WatchNodeView, NumNodeView, ThreeCSGNodeView, FormulaView,
           CodeBlockView, OutputView, InputView, CustomNodeView, BooleanView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView
  };

  nodeViewTypes.Base = ThreeCSGNodeView;
  nodeViewTypes.Show = WatchNodeView;
  nodeViewTypes.Number = NumNodeView;
  nodeViewTypes.CodeBlock = CodeBlockView;
  nodeViewTypes.CustomNode = CustomNodeView;
  nodeViewTypes.Script = FormulaView;
  nodeViewTypes.Input = InputView;
  nodeViewTypes.Output = OutputView;
  nodeViewTypes.Boolean = BooleanView;

  return nodeViewTypes;

});