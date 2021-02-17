#!/usr/bin/env -S yarn ts-node

import { Event } from "@no-day/dependency-graph-package-interface";
import { NpmPackage } from "@no-day/npm.package-type";
import * as cp from "child_process";
import * as chokidar from "chokidar";
import cors from "cors";
import express from "express";
import * as fs from "fs";
import glob from "glob";
import { createServer } from "http";
import * as path from "path";
import socketIO = require("socket.io");
import { pipe } from "fp-ts/function";

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;
const DIR = process.env.DIR || ".";
const CLIENT_DIR = process.env.client_DIR || "";

const app = express();

app.use(cors({}));

const httpServer = createServer(app);

const io = socketIO(httpServer, {
  origins: "*:*",
});

const emitEvent = (event: Event): void => {
  console.log(event._tag);
  io.emit("event", event);
};

const packageJson: { workspaces: [string] } = pipe(
  path.join(DIR, "package.json"),
  fs.readFileSync,
  _ => _.toString(),
  JSON.parse
);

const packagesGlob = packageJson.workspaces[0];

const getData = (): Promise<Data> =>
  new Promise((res, rej) =>
    glob(path.join(DIR, `${packagesGlob}/package.json`), (err, files) => {
      if (err) {
        rej(err);
      }

      const compileReport = JSON.parse(
        cp
          .execSync("tsc --strict --noEmit | tsc-output-parser", { cwd: DIR })
          .toString()
      );

      const packageJsonFiles = files.map(filePath => ({
        filePath: path.relative(DIR, filePath),
        data: JSON.parse(fs.readFileSync(filePath).toString()),
      }));

      res({ compileReport, packageJsonFiles });
    })
  );

const refresh = () => {
  emitEvent({ _tag: "StartLoading" as const });
  getData()
    .then(data => emitEvent({ _tag: "GotData" as const, data }))
    .catch(err => {
      console.log(err);
    });
};

chokidar
  .watch(
    [
      path.join(DIR, `${packagesGlob}/package.json`),
      path.join(DIR, `${packagesGlob}/src/**/*.ts`),
      path.join(DIR, `${packagesGlob}/src/**/*.d.ts`),
      path.join(DIR, `${packagesGlob}/src/**/*.tsx`),
    ],
    { ignoreInitial: true }
  )
  .on("all", (event, filePath) => {
    console.log("all");
    refresh();
  });

const nodeModules = "node_modules";

type Data = { compileReport: any; packageJsonFiles: any };

app.use("/", express.static(path.join(nodeModules, CLIENT_DIR)));

io.on("connection", (socket: any) => {
  console.log("a user connected.");
  refresh();
});

httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://${HOST}:${PORT}`);
  console.log(`⚡️[server]: Watching ${DIR}`);
});
