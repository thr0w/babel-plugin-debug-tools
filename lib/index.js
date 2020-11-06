"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _generator = _interopRequireDefault(require("@babel/generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// const plugin: (p)=>Visitor
var _default = () => {
  const visitor = {
    name: 'babel-debug-tools',
    visitor: {
      ExpressionStatement(path, state) {
        const expr = path.get('expression');

        if (expr && expr.isCallExpression()) {
          const callee = expr.get("callee");
          if (!callee.isMemberExpression()) return;
          const object = callee.get("object");
          const dbgidentifier = state.opts.identifier || 'H5';
          const isH5 = object.isIdentifier({
            name: dbgidentifier
          }) && !object.scope.getBinding(dbgidentifier) && object.scope.hasGlobal(dbgidentifier);

          if (isH5) {
            const mode = state.opts.mode || process.env.NODE_ENV || 'development';

            if (/^production$/gi.test(mode)) {
              path.remove();
            } else {
              const property = callee.get("property");
              if (property.isIdentifier({
                name: 'LOG'
              })) transpileLOG();else if (property.isIdentifier({
                name: 'ASSERT'
              })) transpileASSERT();else if (property.isIdentifier({
                name: 'TRACE'
              }) || property.isIdentifier({
                name: 'CHECK'
              })) {
                path.get('expression').replaceWith(t.logicalExpression('&&', t.identifier(dbgidentifier), t.clone(expr.node)));
              } else if (property.isIdentifier({
                name: 'INIT'
              })) {
                const arg0 = expr.node.arguments[0];
                path.get('expression').replaceWith(t.callExpression(t.clone(arg0), []));
              } else throw path.buildCodeFrameError("Invalid command");
            }
          }

          function transpileLOG() {
            const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()].concat(expr.node.arguments.reduce((prev, curr) => {
              const cclone = t.clone(curr);
              if (t.isStringLiteral(cclone)) prev.push(cclone);else {
                const cname = t.stringLiteral((0, _generator.default)(cclone).code);
                prev.push(t.arrayExpression([cname, cclone]));
              }
              return prev;
            }, [])));
            path.get('expression').replaceWith(t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr));
          }

          function transpileASSERT() {
            const nexpr = t.callExpression(t.clone(callee.node), [calleeLoc()].concat(expr.node.arguments.reduce((prev, curr) => {
              const cclone = t.clone(curr);
              const cname = t.stringLiteral((0, _generator.default)(cclone).code);
              prev.push(t.arrayExpression([cname, cclone]));
              return prev;
            }, [])));
            path.get('expression').replaceWith(t.logicalExpression('&&', t.identifier(dbgidentifier), nexpr));
          }

          function calleeLoc() {
            const loc = callee.node.loc;
            return t.objectExpression([t.objectProperty(t.identifier('filename'), state.filename ? t.stringLiteral(state.filename.replace(state.cwd, '')) : t.identifier('undefined')), t.objectProperty(t.identifier('line'), t.numericLiteral(loc.start.line)), t.objectProperty(t.identifier('column'), t.numericLiteral(loc.start.column))]);
          }
        }
      }

    }
  };
  return visitor;
};

exports.default = _default;