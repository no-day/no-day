import { Switch, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { toDependencyGraph } from "@no-day/dependency-graph-package";
import * as Interface from "@no-day/dependency-graph-package-interface";
import DependencyGraph, * as dependencyGraph from "@no-day/dependency-graph-ui";
import * as Graph_ from "@no-day/graph";
import * as array from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as option from "fp-ts/Option";
import React from "react";
import io from "socket.io-client";
import { ConfigTable } from "../ui";
import "./styles.css";

const GATSBY_BACKEND = process.env.GATSBY_BACKEND || "";
const GATSBY_ROOT_DIR = process.env.GATSBY_ROOT_DIR || ".";

console.log(io);

const socket = io(GATSBY_BACKEND, {});

socket.on("connect", () => {
  console.log("con", socket.id);
});

const onEvent = (cb: (event: Interface.Event) => void): (() => void) => {
  const eventName = "event";
  const emitter = socket.on(eventName, cb);
  return () => emitter.removeListener(eventName);
};

const IndexPage = () => {
  const [data, setData] = React.useState<Interface.Data | null>(null);

  const [showExternal, setShowExternal] = React.useState<
    dependencyGraph.Config["showExternal"]
  >(false);

  const [focusOnNode, setFocusOnNode] = React.useState<
    dependencyGraph.Config["focusOnNode"]
  >(option.none);

  const config: dependencyGraph.Config = { showExternal, focusOnNode };

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() =>
    onEvent(event => {
      switch (event._tag) {
        case "StartLoading":
          setLoading(true);
          break;
        case "GotData":
          setData(event.data);
          setLoading(false);
          break;
      }
    })
  );

  if (!data) return null;

  console.log(data.compileReport);
  const graph = pipe(
    toDependencyGraph({
      packageJsons: data.packageJsonFiles,
      compileReport: data.compileReport,
    }),
    option.toNullable
  );

  if (!graph) return null;

  return (
    <div>
      <div style={{ color: "white" }}>{loading ? "loading..." : "ok"}</div>

      <ConfigTable
        data={[
          {
            label: "Show external",
            node: () => (
              <Switch
                color="primary"
                name="checkedB"
                inputProps={{ "aria-label": "primary checkbox" }}
                value={showExternal}
                onChange={(e, value) => setShowExternal(value)}
              />
            ),
          },
          {
            label: "Focus on on node",
            node: () => (
              <Autocomplete
                options={pipe(
                  graph,
                  Graph_.getNodes,
                  array.filter(([id, { data }]) => data._tag === "Internal"),
                  array.map(([id]) => id)
                )}
                getOptionLabel={option => option}
                style={{ width: 300 }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Focus on Node"
                    variant="outlined"
                  />
                )}
                value={option.toNullable(focusOnNode)}
                onChange={(e, value) =>
                  setFocusOnNode(option.fromNullable(value))
                }
              />
            ),
          },
        ]}
      />
      <DependencyGraph
        graph={graph}
        rootDir={GATSBY_ROOT_DIR}
        config={config}
      />
    </div>
  );
};

export default IndexPage;
