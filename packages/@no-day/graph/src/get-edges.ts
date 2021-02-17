import { pipe } from "fp-ts/lib/pipeable";
import * as Map_ from "fp-ts/Map";
import { ordEdgeId } from "./instances";
import { EdgeContext, EdgeId, Graph } from "./types";

export const getEdges = <Node, Edge>(
  graph: Graph<Node, Edge>
): [EdgeId, EdgeContext<Edge>][] => pipe(graph.edges, Map_.toArray(ordEdgeId));
