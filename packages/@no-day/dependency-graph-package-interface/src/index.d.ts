import { NpmPackage } from "@no-day/npm.package-type";

export type Event =
  | { _tag: "StartLoading" }
  | { _tag: "Connect" }
  | { _tag: "GotData"; data: Data };

export type Data = {
  compileReport: any;
  packageJsonFiles: PackageJsonFile[];
};

export type PackageJsonFile = {
  filePath: string;
  data: NpmPackage;
};
