import { eqString } from "fp-ts/lib/Eq";
import { Option } from "fp-ts/lib/Option";
import { ordString } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as Map_ from "fp-ts/Map";
import * as Option_ from "fp-ts/Option";
import * as Set_ from "fp-ts/Set";
import { Graph, Id, NodeContext } from "./types";

export const getNode = (id: Id) => <Node, Edge>({
  nodes,
}: Graph<Node, Edge>): Option<NodeContext<Node>> =>
  pipe(
    nodes,
    Map_.lookup(eqString)(id),
    Option_.map(nodeInternal => ({
      data: nodeInternal.data,
      incoming: Set_.toArray(ordString)(nodeInternal.incoming),
      outgoing: Set_.toArray(ordString)(nodeInternal.outgoing),
    }))
  );
