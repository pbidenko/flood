define(['BaseNodeView', 'ShowNodeView', 'NumNodeView', 'ThreeCSGNodeView', 'FormulaView', 'WatchNodeView',
'CodeBlockView', 'OutputView', 'InputView', 'CustomNodeView', 'StringView', 'BooleanView', 'ListView'], 
  function(BaseNodeView, ShowNodeView, NumNodeView, ThreeCSGNodeView, FormulaView, WatchNodeView,
  CodeBlockView, OutputView, InputView, CustomNodeView, StringView, BooleanView, ListView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView,
      'List.Create': ListView,
      'Watch': WatchNodeView
  };

  nodeViewTypes.Base = ThreeCSGNodeView;
  nodeViewTypes.Show = ShowNodeView;
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