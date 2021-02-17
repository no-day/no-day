export type EdgeSpec<Edge> = {
  from: Id;
  to: Id;
  data: Edge;
};

export type NodeSpec<Node> = {
  id: Id;
  data: Node;
};

export type Graph<Node, Edge> = {
  readonly brand: unique symbol;
  readonly nodes: NodesInternal<Node>;
  readonly edges: EdgesInternal<Edge>;
};

export type NodesInternal<Node> = Map<Id, NodeInternal<Node>>;

export type EdgesInternal<Edge> = Map<EdgeId, EdgeInternal<Edge>>;

export type NodeInternal<Node> = {
  data: Node;
  incoming: Set<Id>;
  outgoing: Set<Id>;
};

export type EdgeInternal<Edge> = {
  data: Edge;
  from: Id;
  to: Id;
};

export type NodeContext<Node> = {
  data: Node;
  incoming: Array<Id>;
  outgoing: Array<Id>;
};

export type EdgeContext<Edge> = {
  data: Edge;
  from: Id;
  to: Id;
};

export type GraphContext<Node, Edge> = {
  nodes: [Id, NodeContext<Node>][];
  edges: [EdgeId, EdgeContext<Edge>][];
};

export type Id = string;

export type EdgeId = [Id, Id];
