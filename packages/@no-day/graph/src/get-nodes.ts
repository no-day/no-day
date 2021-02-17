import * as Array_ from "fp-ts/Array";
import { ordString } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as Map_ from "fp-ts/Map";
import * as Set_ from "fp-ts/Set";
import { Graph, Id, NodeContext } from "./types";

export const getNodes = <Node, Edge>(
  graph: Graph<Node, Edge>
): [Id, NodeContext<Node>][] =>
  pipe(
    graph.nodes,
    Map_.toArray(ordString),
    Array_.map(([id, nodeInternal]) => [
      id,
      {
        data: nodeInternal.data,
        incoming: Set_.toArray(ordString)(nodeInternal.incoming),
        outgoing: Set_.toArray(ordString)(nodeInternal.outgoing),
      },
    ])
  );
