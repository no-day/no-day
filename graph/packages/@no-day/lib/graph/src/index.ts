import { EdgeId } from "@no-day/edge-id";
import { EdgeInternal } from "@no-day/edge-internal";

export type Graph<Id, Node, Edge> = {
  readonly brand: unique symbol;
  // readonly nodes: NodesInternal<Id, Node>;
  readonly edges: EdgesInternal<Id, Edge>;
};

// export type NodesInternal<Id, Node> = Map<Id, NodeInternal<Id, Node>>;

export type EdgesInternal<Id, Edge> = Map<EdgeId<Id>, EdgeInternal<Id, Edge>>;

// export type NodeInternal<Id, Node> = {
//   data: Node;
//   incoming: Set<Id>;
//   outgoing: Set<Id>;
// };
