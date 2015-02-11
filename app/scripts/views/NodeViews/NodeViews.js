define(['BaseNodeView', 'WatchNodeView', 'NumNodeView', 'ThreeCSGNodeView', 'FormulaView', 'IntNodeView',
'CodeBlockView', 'OutputView', 'InputView', 'CustomNodeView', 'StringView', 'BooleanView', 'ListView'],
  function(BaseNodeView, WatchNodeView, NumNodeView, ThreeCSGNodeView, FormulaView, IntNodeView,
  CodeBlockView, OutputView, InputView, CustomNodeView, StringView, BooleanView, ListView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView,
      'List.Create': ListView,
      'Integer Slider': IntNodeView,
      'Double Slider': NumNodeView

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