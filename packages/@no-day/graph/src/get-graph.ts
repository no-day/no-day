import { getEdges } from "./get-edges";
import { getNodes } from "./get-nodes";
import { Graph, GraphContext } from "./types";

export const getGraph = <Node, Edge>(
  graph: Graph<Node, Edge>
): GraphContext<Node, Edge> => ({
  nodes: getNodes(graph),
  edges: getEdges(graph),
});
