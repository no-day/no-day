import { pipe } from "fp-ts/function";
import { eqString } from "fp-ts/lib/Eq";
import * as Map_ from "fp-ts/Map";
import * as Option_ from "fp-ts/Option";
import * as Set_ from "fp-ts/Set";
import { Graph, Id, NodeSpec } from "./types";

export const insertNode = <Node, Edge>({ id, data }: NodeSpec<Node>) => (
  graph: Graph<Node, Edge>
): Graph<Node, Edge> => ({
  ...graph,
  nodes: pipe(
    graph.nodes,
    Map_.modifyAt(eqString)(id, nodeInternal => ({ ...nodeInternal, data })),
    Option_.getOrElse(() =>
      pipe(
        graph.nodes,
        Map_.insertAt(eqString)(id, {
          data,
          incoming: Set_.empty as Set<Id>,
          outgoing: Set_.empty as Set<Id>,
        })
      )
    )
  ),
});

export default insertNode;
