import { Graph } from "@no-day/graph";

type Id = string;

export type Tags<T> =
  | { _tag: "Collection"; values: Set<T> }
  | { _tag: "Transformation"; from: Set<T>; to: Set<T>; context: Set<T> };

export type Node = NodeInternal | NodeExternal;

export type Problem = {
  filePath: string;
  message: string;
  cursor?: { line: number; col: number };
};

export type NodeInternal = {
  _tag: "Internal";
  tags?: Tags<string>;
  isEntryPoint?: boolean;
  localFilePath?: string;
  problems?: Problem[];
};

export type NodeExternal = { _tag: "External" };

export type Edge = null;

export type DependencyGraph = Graph<Node, Edge>;

export { DependencyGraph as default };
