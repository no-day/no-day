import * as Map_ from "fp-ts/Map";
import { graphBrand } from "./graph-brand";
import { Graph } from "./types";

export const empty = <Node, Edge>(): Graph<Node, Edge> => ({
  ...graphBrand,
  nodes: Map_.empty,
  edges: Map_.empty,
});
