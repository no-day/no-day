import { pipe } from "fp-ts/lib/pipeable";
import * as Graph_ from "../src";

test("insert a node to a graph", () => {
  expect(
    pipe(
      Graph_.empty() as Graph_.Graph<null, null>,
      Graph_.insertNode({ id: "A", data: null }),
      Graph_.getGraph
    )
  ).toStrictEqual({
    nodes: [["A", { outgoing: [], incoming: [], data: null }]],
    edges: [],
  });
});
