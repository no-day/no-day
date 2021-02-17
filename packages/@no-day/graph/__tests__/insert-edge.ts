import { pipe } from "fp-ts/lib/pipeable";
import * as Option_ from "fp-ts/Option";
import * as Graph_ from "../src";

const graph = pipe(
  Graph_.empty() as Graph_.Graph<null, null>,
  Graph_.insertNode({ id: "A", data: null }),
  Graph_.insertNode({ id: "B", data: null })
);

test("insert an edge to a graph", () => {
  expect(
    pipe(
      graph,
      Graph_.insertEdge({ from: "A", to: "B", data: null }),
      Option_.map(Graph_.getGraph)
    )
  ).toStrictEqual(
    Option_.some({
      nodes: [
        ["A", { outgoing: ["B"], incoming: [], data: null }],
        ["B", { outgoing: [], incoming: ["A"], data: null }],
      ],
      edges: [[["A", "B"], { from: "A", to: "B", data: null }]],
    })
  );
});
