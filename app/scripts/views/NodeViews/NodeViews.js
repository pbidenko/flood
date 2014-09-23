define(['BaseNodeView', 'WatchNodeView', 'NumNodeView', 'ThreeCSGNodeView', 'FormulaView', 'CodeBlockView', 'OutputView', 'InputView', 'CustomNodeView'], 
  function(BaseNodeView, WatchNodeView, NumNodeView, ThreeCSGNodeView, FormulaView, CodeBlockView, OutputView, InputView, CustomNodeView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView
  };

  nodeViewTypes.Base = ThreeCSGNodeView;
  nodeViewTypes.Watch = WatchNodeView;
  nodeViewTypes.Number = NumNodeView;
  nodeViewTypes.CodeBlock = CodeBlockView;
  nodeViewTypes.CustomNode = CustomNodeView;
  nodeViewTypes.Formula = FormulaView;
  nodeViewTypes.Input = InputView;
  nodeViewTypes.Output = OutputView;

  return nodeViewTypes;

});