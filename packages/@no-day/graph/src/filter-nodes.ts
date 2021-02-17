import * as Array_ from "fp-ts/Array";
import { pipe } from "fp-ts/lib/pipeable";
import deleteNode from "./delete-node";
import { getNodes } from "./get-nodes";
import { Graph, NodeContext } from "./types";

export const filterNodes = <Node, Edge>(
  pred: (nodeContext: NodeContext<Node>) => boolean
) => (
  graph: Graph<Node, Edge> //: Graph<Node, Edge> =>
) =>
  pipe(
    graph,
    getNodes,
    Array_.filter(([key, value]) => !pred(value)),
    Array_.reduce(graph, (acc, [key, value]) => deleteNode(key)(acc))
  );

export default filterNodes;
