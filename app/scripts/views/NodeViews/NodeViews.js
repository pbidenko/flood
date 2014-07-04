define(['BaseNodeView', 'WatchNodeView', 'NumNodeView', 'CSGNodeView', 'FormulaView', 'CodeBlockView'], function(BaseNodeView, WatchNodeView, NumNodeView, CSGNodeView, FormulaView, CodeBlockView){

  var nodeViewTypes = {
      'Code Block': CodeBlockView
  };

  nodeViewTypes.Base = CSGNodeView;
  nodeViewTypes.Watch = WatchNodeView;
  nodeViewTypes.Number = NumNodeView;
  nodeViewTypes.CodeBlock = CodeBlockView;
  nodeViewTypes.Formula = FormulaView;

  // nodeViewTypes.SolidSphere = CSGNodeView;
  // nodeViewTypes.SolidCylinder = CSGNodeView;
  // nodeViewTypes.SolidCube = CSGNodeView;
  // nodeViewTypes.SolidExtrusion = CSGNodeView;

  // nodeViewTypes.SolidUnion = CSGNodeView;
  // nodeViewTypes.SolidUnionAll = CSGNodeView;
  // nodeViewTypes.SolidIntersect = CSGNodeView;
  // nodeViewTypes.SolidSubtract = CSGNodeView;
  // nodeViewTypes.Move = CSGNodeView;
  // nodeViewTypes.Rotate = CSGNodeView;
  // nodeViewTypes.Scale = CSGNodeView;
  // nodeViewTypes.Point = CSGNodeView;
  // nodeViewTypes.Plane = CSGNodeView;
  // nodeViewTypes.RegularPolygon = CSGNodeView;

  return nodeViewTypes;

});