export type EdgeInternal<Id, Edge> = {
  data: Edge;
  from: Id;
  to: Id;
};
