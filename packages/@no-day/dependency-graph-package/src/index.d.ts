import { GrammarItem } from "@aivenio/tsc-output-parser";
import { PackageJsonFile } from "@no-day/dependency-graph-package-interface";
import * as dependencyGraph from "@no-day/dependency-graph-types";
import { Option } from "fp-ts/Option";
export declare const toDependencyGraph: ({
  packageJsons,
  compileReport,
}: {
  packageJsons: PackageJsonFile[];
  compileReport: GrammarItem[];
}) => Option<dependencyGraph.DependencyGraph>;
//# sourceMappingURL=index.d.ts.map
