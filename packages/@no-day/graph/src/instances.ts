import { Eq, eqString, getTupleEq } from "fp-ts/lib/Eq";
import { getTupleOrd, Ord, ordString } from "fp-ts/lib/Ord";
import { EdgeId } from "./types";

export const eqEdgeId: Eq<EdgeId> = getTupleEq(eqString, eqString);

export const ordEdgeId: Ord<EdgeId> = getTupleOrd(ordString, ordString);
