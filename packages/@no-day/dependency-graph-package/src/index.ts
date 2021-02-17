import { GrammarItem } from "@aivenio/tsc-output-parser";
import { PackageJsonFile } from "@no-day/dependency-graph-package-interface";
import * as dependencyGraph from "@no-day/dependency-graph-types";
import * as graph from "@no-day/graph";
import * as array from "fp-ts/Array";
import { eqString } from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as map from "fp-ts/Map";
import * as option from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import * as record from "fp-ts/Record";

const filePathToDir = (filePath: string): Option<string> =>
  pipe(filePath, _ => _.split("/"), array.lookup(1));

const packageJsonFileToNodeSpecInternal = ({
  problems,
}: {
  problems: Map<string, dependencyGraph.Problem[]>;
}) => ({
  filePath: filePath,
  data: { name, module: module_ },
}: PackageJsonFile): graph.NodeSpec<dependencyGraph.Node>[] => [
  {
    id: name,
    data: {
      _tag: "Internal",
      isEntryPoint: !!module_,
      localFilePath: filePath,
      problems: pipe(
        filePath,
        filePathToDir,
        option.chain(dir => map.lookup(eqString)(dir)(problems)),
        option.getOrElse<dependencyGraph.Problem[]>(() => [])
      ),
    },
  },
];

const packageJsonFileToNodeSpecExternal = ({
  data: { dependencies },
}: PackageJsonFile): graph.NodeSpec<dependencyGraph.Node>[] =>
  pipe(
    dependencies || {},
    record.collect(packageName => ({
      id: packageName,
      data: { _tag: "External" },
    }))
  );

const packageJsonFileToEdgeSpec = ({
  data: { name: from, dependencies },
}: PackageJsonFile): graph.EdgeSpec<dependencyGraph.Edge>[] =>
  pipe(
    dependencies || {},
    record.collect(to => ({ from, to, data: null }))
  );

const grammarItemToProblem = (
  grammarItem: GrammarItem
): dependencyGraph.Problem => ({
  filePath: grammarItem.value.path.value,
  message: grammarItem.value.message.value,
});

const getProblemsDict = (
  problems: dependencyGraph.Problem[]
): Map<string, dependencyGraph.Problem[]> =>
  pipe(
    problems,
    array.reduce(
      map.empty as Map<string, dependencyGraph.Problem[]>,
      (acc, item) =>
        pipe(
          item.filePath,
          filePathToDir,
          option.map(dir =>
            map.insertAt(eqString)(dir /* TODO */, [item])(acc)
          ),
          option.getOrElse(() => acc)
        )
    )
  );

export const toDependencyGraph = ({
  packageJsons,
  compileReport,
}: {
  packageJsons: PackageJsonFile[];
  compileReport: GrammarItem[];
}): Option<dependencyGraph.DependencyGraph> => {
  console.log(
    pipe(compileReport, array.map(grammarItemToProblem), getProblemsDict)
  );
  return graph.fromNodesAndEdges(
    [
      ...pipe(packageJsons, array.chain(packageJsonFileToNodeSpecExternal)),
      ...pipe(
        packageJsons,
        array.chain(
          packageJsonFileToNodeSpecInternal({
            problems: pipe(
              compileReport,
              array.map(grammarItemToProblem),
              getProblemsDict
            ),
          })
        )
      ),
    ],
    pipe(packageJsons, array.chain(packageJsonFileToEdgeSpec))
  );
};
