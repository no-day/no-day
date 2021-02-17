import * as Array_ from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as Option_ from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import { empty } from "./empty";
import insertEdge from "./insert-edge";
import insertNode from "./insert-node";
import { EdgeSpec, Graph, NodeSpec } from "./types";

const insertNodes = <Node>(nodeSpecs: NodeSpec<Node>[]) => <Edge>(
  graph: Graph<Node, Edge>
): Graph<Node, Edge> =>
  pipe(
    nodeSpecs,
    Array_.reduce(graph, (acc, nodeSpec) => pipe(acc, insertNode(nodeSpec)))
  );

const insertEdges = <Edge>(edgeSpecs: EdgeSpec<Edge>[]) => <Node>(
  graph: Graph<Node, Edge>
): Option<Graph<Node, Edge>> =>
  pipe(
    edgeSpecs,
    Array_.reduce(Option_.of(graph), (acc, edgeSpec) =>
      pipe(acc, Option_.chain(insertEdge(edgeSpec)))
    )
  );

export const fromNodesAndEdges = <Node, Edge>(
  nodeSpecs: NodeSpec<Node>[],
  edgeSpecs: EdgeSpec<Edge>[]
): Option<Graph<Node, Edge>> =>
  pipe(
    empty() as Graph<Node, Edge>,
    insertNodes(nodeSpecs),
    insertEdges(edgeSpecs)
  );
