"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDependencyGraph = void 0;
var graph = __importStar(require("@no-day/graph"));
var array = __importStar(require("fp-ts/Array"));
var Eq_1 = require("fp-ts/lib/Eq");
var function_1 = require("fp-ts/lib/function");
var map = __importStar(require("fp-ts/Map"));
var option = __importStar(require("fp-ts/Option"));
var record = __importStar(require("fp-ts/Record"));
var filePathToDir = function (filePath) {
  return function_1.pipe(
    filePath,
    function (_) {
      return _.split("/");
    },
    array.lookup(1)
  );
};
var packageJsonFileToNodeSpecInternal = function (_a) {
  var problems = _a.problems;
  return function (_a) {
    var filePath = _a.filePath,
      _b = _a.data,
      name = _b.name,
      module_ = _b.module;
    return [
      {
        id: name,
        data: {
          _tag: "Internal",
          isEntryPoint: !!module_,
          localFilePath: filePath,
          problems: function_1.pipe(
            filePath,
            filePathToDir,
            option.chain(function (dir) {
              return map.lookup(Eq_1.eqString)(dir)(problems);
            }),
            option.getOrElse(function () {
              return [];
            })
          ),
        },
      },
    ];
  };
};
var packageJsonFileToNodeSpecExternal = function (_a) {
  var dependencies = _a.data.dependencies;
  return function_1.pipe(
    dependencies || {},
    record.collect(function (packageName) {
      return {
        id: packageName,
        data: { _tag: "External" },
      };
    })
  );
};
var packageJsonFileToEdgeSpec = function (_a) {
  var _b = _a.data,
    from = _b.name,
    dependencies = _b.dependencies;
  return function_1.pipe(
    dependencies || {},
    record.collect(function (to) {
      return { from: from, to: to, data: null };
    })
  );
};
var grammarItemToProblem = function (grammarItem) {
  return {
    filePath: grammarItem.value.path.value,
    message: grammarItem.value.message.value,
  };
};
var getProblemsDict = function (problems) {
  return function_1.pipe(
    problems,
    array.reduce(map.empty, function (acc, item) {
      return function_1.pipe(
        item.filePath,
        filePathToDir,
        option.map(function (dir) {
          return map.insertAt(Eq_1.eqString)(dir /* TODO */, [item])(acc);
        }),
        option.getOrElse(function () {
          return acc;
        })
      );
    })
  );
};
var toDependencyGraph = function (_a) {
  var packageJsons = _a.packageJsons,
    compileReport = _a.compileReport;
  console.log(
    function_1.pipe(
      compileReport,
      array.map(grammarItemToProblem),
      getProblemsDict
    )
  );
  return graph.fromNodesAndEdges(
    __spreadArrays(
      function_1.pipe(
        packageJsons,
        array.chain(packageJsonFileToNodeSpecExternal)
      ),
      function_1.pipe(
        packageJsons,
        array.chain(
          packageJsonFileToNodeSpecInternal({
            problems: function_1.pipe(
              compileReport,
              array.map(grammarItemToProblem),
              getProblemsDict
            ),
          })
        )
      )
    ),
    function_1.pipe(packageJsons, array.chain(packageJsonFileToEdgeSpec))
  );
};
exports.toDependencyGraph = toDependencyGraph;
//# sourceMappingURL=index.js.map
