import MUISwitch from "@material-ui/core/Switch";
import * as array from "fp-ts/Array";
import { flow, pipe } from "fp-ts/function";
import { Iso } from "monocle-ts";
import React, { FC, ReactElement } from "react";

export type GetSet<T> = [T, (value: T) => void];

export const liftGetSet = <G, T>(iso: Iso<G, T>) => ([
  get,
  set,
]: GetSet<G>): GetSet<T> => [iso.get(get), flow(iso.reverseGet, set)];

export const Toggle: FC<{ getSet: GetSet<boolean> }> = ({
  getSet: [get, set],
}) => {
  return (
    <MUISwitch
      color="primary"
      name="checkedB"
      inputProps={{ "aria-label": "primary checkbox" }}
      onChange={(e, checked) => set(checked)}
    />
  );
};

export const TextInput: FC<{ getSet: GetSet<string> }> = ({
  getSet: [get, set],
}) => {
  return <input type="text" value={get} onChange={e => set(e.target.value)} />;
};

export const ConfigTable: FC<{
  data: { label: string; node: () => ReactElement }[];
}> = ({ data }) => (
  <table style={{ background: "grey", padding: "20px" }}>
    {pipe(
      data,
      array.map(({ label, node }) => (
        <tr>
          <td>{label}</td>
          <td>{node()}</td>
        </tr>
      ))
    )}
  </table>
);
