import * as Array_ from "fp-ts/Array";
import { Eq, eqString } from "fp-ts/lib/Eq";
import { ordString } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as Map_ from "fp-ts/Map";
import * as Option_ from "fp-ts/Option";
import * as Set_ from "fp-ts/Set";
import { eqEdgeId } from "./instances";
import { EdgeId, Graph, Id, NodeInternal } from "./types";

const deleteKeys = <K>(E: Eq<K>) => (keys: K[]) => <V>(
  map: Map<K, V>
): Map<K, V> =>
  pipe(
    keys,
    Array_.reduce(map, (acc, key) => Map_.deleteAt(E)(key)(acc))
  );

const outgoingEdgeIds = (from: Id, toSet: Set<Id>): EdgeId[] =>
  pipe(
    toSet,

    Set_.toArray(ordString),
    Array_.map(to => [from, to] as [Id, Id])
  );

const incomingEdgeIds = (fromSet: Set<Id>, to: Id): EdgeId[] =>
  pipe(
    fromSet,
    Set_.toArray(ordString),
    Array_.map(from => [from, to] as [Id, Id])
  );

const deleteNodeInternal = <Node, Edge>(
  id: Id,
  { outgoing, incoming }: NodeInternal<Node>,
  graph: Graph<Node, Edge>
): Graph<Node, Edge> => ({
  ...graph,
  nodes: pipe(graph.nodes, Map_.deleteAt(eqString)(id)),
  edges: pipe(
    graph.edges,
    deleteKeys(eqEdgeId)(outgoingEdgeIds(id, outgoing)),
    deleteKeys(eqEdgeId)(incomingEdgeIds(incoming, id))
  ),
});

export const deleteNode = (id: Id) => <Node, Edge>(
  graph: Graph<Node, Edge> //: Graph<Node, Edge>
) =>
  pipe(
    graph.nodes,
    Map_.lookup(eqString)(id),
    Option_.map(nodeInternal => deleteNodeInternal(id, nodeInternal, graph)),
    Option_.getOrElse(() => graph)
  );

export default deleteNode;
