import Node from "@no-day/dependency-graph-node-ui";
import * as Types from "@no-day/dependency-graph-types";
import * as Graph_ from "@no-day/graph";
import { Graph } from "@no-day/graph";
import {
  CustomNodeLabelProps,
  DagreReact,
  EdgeOptions,
  NodeOptions,
  RecursivePartial,
} from "dagre-reactjs";
import * as boolean from "fp-ts/boolean";
import * as Array_ from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as option from "fp-ts/Option";
import * as Option_ from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import * as path from "path";
import React, { useEffect, useState } from "react";

export type Props = {
  graph: Types.DependencyGraph;
  rootDir?: string;
  config: Config;
};

export type Config = {
  showExternal: boolean;
  focusOnNode: Option<string>;
};

const isSubNode = <Node, Edge>(opts: {
  direction: "outgoing" | "incoming";
  pred: (nodeEntry: [string, Graph_.NodeContext<Node>]) => boolean;
  graph: Graph<Node, Edge>;
}) => (id: string): boolean =>
  pipe(
    opts.graph,
    Graph_.getNode(id),
    Option_.map(nodeContext =>
      boolean.fold(
        () =>
          pipe(
            nodeContext,
            _ => _[opts.direction],
            Array_.map(isSubNode(opts)),
            Array_.reduce(false, (acc, x) => acc || x)
          ),
        () => true
      )(opts.pred([id, nodeContext]))
    ),
    Option_.getOrElse<boolean>(() => false)
  );

const showNode = (config: Config, graph: Types.DependencyGraph) => (
  id: string
): boolean =>
  pipe(
    Graph_.getNode(id)(graph),
    Option_.map(
      ({ data }) =>
        (config.showExternal || data._tag === "Internal") &&
        pipe(
          config.focusOnNode,
          Option_.fold(
            () => true,
            focusId =>
              focusId === id ||
              isSubNode({
                direction: "incoming",
                pred: ([otherId]) => otherId === focusId,
                graph,
              })(id)
          )
        )
    ),
    Option_.getOrElse(() => false as boolean)
  );

const getNodes = (
  config: Config,
  graph: Types.DependencyGraph
): Array<RecursivePartial<NodeOptions>> => {
  return pipe(
    graph,
    Graph_.getNodes,
    Array_.filter(([id]) => showNode(config, graph)(id)),
    Array_.map(([id, _]) => ({
      id,
      label: id,
      labelType: "default",
      meta: {
        nodeContext: pipe(
          graph,
          Graph_.getNode(id),
          option.getOrElse(() => 1 as any) // TODO
        ),
        errored: isSubNode({
          pred: ([, nodeContext]) =>
            nodeContext.data._tag === "Internal" &&
            (nodeContext.data.problems?.length || 0) > 0,
          direction: "outgoing",
          graph,
        })(id),
      },
    }))
  );
};

const getEdges = (
  config: Config,
  graph: Types.DependencyGraph
): Array<RecursivePartial<EdgeOptions>> =>
  pipe(
    graph,
    Graph_.getEdges,
    Array_.filter(
      ([[from, to]]) =>
        showNode(config, graph)(from) && showNode(config, graph)(to)
    ),
    Array_.map(([[from, to]]) => ({
      from,
      to,
    }))
  );

const DEFAULT_NODE_CONFIG: RecursivePartial<NodeOptions> = {
  styles: {
    node: {
      // styles: {},
    },
    shape: {
      styles: { stroke: "transparent", overflow: "unset" },
    },
    label: {
      styles: { overflow: "unset" },
    },
  },
};

const DEFAULT_EDGE_CONFIG: RecursivePartial<EdgeOptions> = {
  styles: {
    edge: {
      styles: { stroke: "darkgrey", fill: "transparent" },
    },
    marker: {
      styles: { stroke: "darkgrey", fill: "darkgrey" },
    },
  },
};

const mkRenderer = (graph: Types.DependencyGraph, rootDir: string) => ({
  node,
}: CustomNodeLabelProps) => {
  return (
    <Node
      id={node.id}
      {...(node.meta as any)}
      onClick={
        rootDir
          ? filePath =>
              window.open("vscode://file/" + path.join(rootDir, filePath))
          : undefined
      }
    />
  );
};

export const DependencyGraph: React.FC<Props> = ({
  graph,
  rootDir,
  config,
}) => {
  const [state, setState] = React.useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<Option<string>>(option.none);

  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    setStage(st => st + 1);
  }, [graph, rootDir, config]);

  const renderer = mkRenderer(graph, rootDir || "");

  return (
    <div>
      <svg width={state.width} height={state.height}>
        <DagreReact
          stage={stage}
          nodes={getNodes(config, graph)}
          edges={getEdges(config, graph)}
          graphLayoutComplete={(width?: number, height?: number) => {
            if (!width || !height) return;
            setState({ width, height });
          }}
          defaultNodeConfig={DEFAULT_NODE_CONFIG}
          defaultEdgeConfig={DEFAULT_EDGE_CONFIG}
          graphOptions={{
            marginx: 15,
            marginy: 15,
            rankdir: "LR",
            ranksep: 55,
            nodesep: 15,
          }}
          customNodeLabels={{
            default: {
              renderer,
              html: true,
            },
          }}
        />
      </svg>
    </div>
  );
};

export default DependencyGraph;
