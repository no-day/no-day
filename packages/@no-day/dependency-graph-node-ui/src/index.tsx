import styled from "@emotion/styled";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import * as Types from "@no-day/dependency-graph-types";
import { NodeExternal, NodeInternal } from "@no-day/dependency-graph-types";
import * as Graph_ from "@no-day/graph";
import chroma, { Color } from "chroma-js";
import { pipe } from "fp-ts/function";
import * as Option_ from "fp-ts/Option";
import Identicon from "identicon.js";
import JsSha from "jssha";
import React, { FC } from "react";
import "./reset.css";
import "./styles.css";

const Root = styled.div<{
  node: Types.Node;
  textColor: Color;
  errored: boolean;
}>(
  {
    border: `1px solid ${chroma("darkgrey").hex()}`,

    padding: "1px",
    margin: "0px",
    fontFamily: "Arial",
    fontSize: "10px",
    width: "200px",
    height: "20px",
    boxSizing: "border-box",

    display: "flex",
    //  justifyContent: "center",
    alignItems: "center",
  },

  ({ node, errored }) => {
    const color = errored ? "red" : "grey";

    return { border: `1px solid ${color}` };
  },

  ({ node, onClick, textColor }) => {
    const color =
      node._tag === "External"
        ? chroma("aqua").darken(4.5)
        : node._tag === "Internal" && node.isEntryPoint
        ? chroma("black").brighten(1)
        : chroma("black").brighten(2);

    return {
      color: textColor.hex(),
      backgroundColor: color.hex(),
      ...(onClick && {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: color.brighten(0.5).hex(),
        },
      }),
    };
  }
);

type Props = {
  id: string;
  nodeContext: Graph_.NodeContext<Types.Node>;
  onClick?: (path: string) => void;
  errored: boolean;
};

export const NodeExternalUI: FC<{
  id: string;
  node: NodeExternal;
}> = ({ id, node }) => (
  <Root node={node} textColor={chroma("white")} errored={false}>
    {id}
  </Root>
);

const useStyles = makeStyles(theme => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
    width: "200px",
    height: "100px",
  },
}));

export const NodeInternalUI: FC<{
  id: string;
  node: NodeInternal;
  openFile?: (path: string) => void;
  errored: boolean;
}> = ({ node, id, openFile, errored }) => {
  const sha = new JsSha("SHA-1", "TEXT", { encoding: "UTF8" });
  sha.update(id);

  const identicon_ = new Identicon(sha.getHash("HEX"), {
    size: 20,
    background: chroma("black").brighten(1).rgba(),
    margin: 0.15,
  });

  const textColor = chroma(identicon_.foreground).brighten(2);

  const identicon = new Identicon(sha.getHash("HEX"), {
    size: 20,
    background: chroma("black").brighten(1).rgba(),
    foreground: ((): [number, number, number, number] => {
      const color = textColor.rgba();
      color[3] = 255;
      return color;
    })(),
    margin: 0.15,
  });

  const imgData = "data:image/png;base64," + identicon.toString();

  const onClick = pipe(
    Option_.bindTo("openFile")(Option_.fromNullable(openFile)),
    Option_.bind("localFilePath", () =>
      Option_.fromNullable(node.localFilePath)
    ),
    Option_.map(({ openFile, localFilePath }) => () => openFile(localFilePath))
  );

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event: any) => {
    console.log("open");
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    console.log("close");
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const classes = useStyles();

  return (
    <Root
      node={node}
      textColor={textColor}
      onClick={Option_.toUndefined(onClick)}
      errored={errored}
      //onMouseEnter={handlePopoverOpen}
      //onMouseLeave={handlePopoverClose}
    >
      <img src={imgData} />
      {id}
      <Popover
        id="mouse-over-popover"
        open={open}
        anchorEl={anchorEl}
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        //onClose={handlePopoverClose}
        //onEnter={handlePopoverClose}
        //disableRestoreFocus
      >
        I use Popover.
      </Popover>
    </Root>
  );
};

export const Node: FC<Props> = ({
  id,
  nodeContext,
  onClick: openFile,
  errored,
}) => {
  const { data: node } = nodeContext;

  switch (node._tag) {
    case "Internal":
      return (
        <NodeInternalUI
          id={id}
          openFile={openFile}
          node={node}
          errored={errored}
        />
      );
    case "External":
      return <NodeExternalUI id={id} node={node} />;
  }
};

export default Node;
