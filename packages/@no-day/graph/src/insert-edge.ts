import { log } from "@no-day/debug-log";
import { pipe } from "fp-ts/function";
import { eqString } from "fp-ts/lib/Eq";
import * as Map_ from "fp-ts/Map";
import * as Option_ from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import * as Set_ from "fp-ts/Set";
import { graphBrand } from "./graph-brand";
import { eqEdgeId } from "./instances";
import {
  EdgesInternal,
  EdgeSpec,
  Graph,
  Id,
  NodeInternal,
  NodesInternal,
} from "./types";

const insertIncoming = (from: Id) => <Node>(
  nodeInternal: NodeInternal<Node>
): NodeInternal<Node> => ({
  ...nodeInternal,
  incoming: pipe(nodeInternal.incoming, Set_.insert(eqString)(from)),
});

const insertOutgoing = (to: Id) => <Node>(
  nodeInternal: NodeInternal<Node>
): NodeInternal<Node> => ({
  ...nodeInternal,
  outgoing: pipe(nodeInternal.outgoing, Set_.insert(eqString)(to)),
});

const modifyNodesInternal = <Node>(from: Id, to: Id) => (
  nodes: NodesInternal<Node>
): Option<NodesInternal<Node>> =>
  pipe(
    nodes,
    Map_.modifyAt(eqString)(from, insertOutgoing(to)),
    Option_.chain(Map_.modifyAt(eqString)(to, insertIncoming(from))),
    log()
  );

const insertEdgeInternal = <Edge>(from: Id, to: Id, data: Edge) => (
  edges: EdgesInternal<Edge>
): EdgesInternal<Edge> =>
  pipe(
    edges,
    Map_.insertAt(eqEdgeId)([from, to] as [Id, Id], { data, from, to })
  );

export const insertEdge = <Node, Edge>({ from, to, data }: EdgeSpec<Edge>) => (
  graph: Graph<Node, Edge>
): Option<Graph<Node, Edge>> =>
  pipe(
    graph.nodes,
    modifyNodesInternal(from, to),
    Option_.map(nodes => ({
      ...graphBrand,
      nodes,
      edges: insertEdgeInternal(from, to, data)(graph.edges),
    }))
  );

export default insertEdge;
