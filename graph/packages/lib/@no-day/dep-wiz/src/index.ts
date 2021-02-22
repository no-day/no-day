import { flow, pipe } from "fp-ts/function";
import * as fs from "fs";
import glob from "glob";
import * as array from "fp-ts/Array";
import * as cp from "child_process";
import * as path from "path";
import { eqString } from "fp-ts/lib/Eq";

const exclude = ["fs", "path", "child_process"];

type PackageJsonMonoRoot = {
  workspaces: string[];
};

type Import = {
  scope?: string;
  name: string;
  path?: string;
};

type YarnWorkspacesInfo = Record<string, unknown>;

type PackageJson = { name: string; dependencies?: unknown };

type WithPackagePath = { packagePath: string };

type WithWorkspaces = { workspaces: string[] };

const importToPackage: (_: Import) => string = ({ scope, name }) =>
  scope ? `${scope}/${name}` : name;

const getImports = (src: string): Import[] => {
  const regex = /from \"(?:(@[a-z][a-z0-9_-]*)\/)?([a-z][a-z0-9_-]*)(?:\/(.+))?\"/g;

  let result;
  let matches: Import[] = [];

  while ((result = regex.exec(src))) {
    matches.push({
      scope: result[1],
      name: result[2],
      path: result[3],
    });
  }

  return matches;
};

const packageNameToAddCmd: (_: {
  isWorkspace: (_: string) => boolean;
}) => (_: string) => string = ({ isWorkspace }) => packageName =>
  isWorkspace(packageName) ? `${packageName}@*` : packageName;

const handleImport = ({
  workspaces,
  packagePath,
}: WithPackagePath & WithWorkspaces) => (import_: Import): void => {
  const packageName = pipe(import_, importToPackage);

  if (array.elem(eqString)(packageName)(exclude)) return;

  const addCmd = pipe(
    packageName,
    packageNameToAddCmd({
      isWorkspace: _ => array.elem(eqString)(_)(workspaces),
    })
  );

  cp.execSync(`yarn add '${addCmd}'`, { cwd: packagePath });
};

const handleFile = ({
  packagePath,
  workspaces,
}: WithPackagePath & WithWorkspaces) => (filePath: string): void => {
  console.log(`FILE: ${filePath}`);

  const imports = pipe(
    fs.readFileSync(filePath),
    _ => _.toString(),
    getImports
  );

  pipe(imports, array.map(handleImport({ workspaces, packagePath })));
};

const removeDependencies = (packagePath: string) => {
  const pathPackageJson = path.join(packagePath, "package.json");

  pipe(
    fs.readFileSync(pathPackageJson),
    _ => _.toString(),
    JSON.parse,
    _ => _ as PackageJson,
    _ => ({ ..._, dependencies: [] }),
    _ => JSON.stringify(_, null, 2),
    _ => fs.writeFileSync(pathPackageJson, _)
  );
};

// const renamePackage = ({ packagePath }: WithPackagePath) => {
//   const pathPackageJson = path.join(packagePath, "package.json");

//   const { name } = pipe(
//     fs.readFileSync(pathPackageJson),
//     _ => _.toString(),
//     JSON.parse,
//     _ => _ as PackageJson
//   );

//   //fs.renameSync(packagePath, )
// };

const handlePackage = ({ workspaces }: WithWorkspaces) => (
  packagePath: string
): void => {
  console.log(`PACKAGE: ${packagePath}`);

  const srcFiles = glob.sync(`${packagePath}/src/**/*.ts`);

  removeDependencies(packagePath);

  pipe(srcFiles, array.map(handleFile({ packagePath, workspaces })));
};

const getWorkspaces = (): YarnWorkspacesInfo =>
  pipe(
    cp.execSync("yarn workspaces info"),
    _ => _.toString(),
    JSON.parse,
    _ => _ as YarnWorkspacesInfo
  );

export const main = () => {
  const workspaces: string[] = pipe(getWorkspaces(), Object.keys);

  const packagePaths: string[] = pipe(
    fs.readFileSync("package.json"),
    _ => _.toString(),
    JSON.parse,
    _ => _ as PackageJsonMonoRoot,
    _ => _.workspaces,
    flow(array.chain(glob.sync))
  );

  pipe(packagePaths, array.map(handlePackage({ workspaces })));

  console.log("dep wiz!");
};
