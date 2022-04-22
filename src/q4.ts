import { join, last, map, update } from 'ramda';
import { AppExp, Binding, CExp, Exp, isAppExp, isBoolExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, LetExp, LitExp, makeAppExp, makeProcExp, PrimOp, ProcExp, Program, VarDecl } from '../imp/L3-ast';
import { SymbolSExp, isSymbolSExp, Value, isClosure, isEmptySExp, isCompoundSExp, Closure, CompoundSExp } from '../imp/L3-value';
import { Result, makeOk } from '../shared/result';
import { isNumber, isString } from '../shared/type-predicates';

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/

// Done
const OpToString = (op: string): string =>  
    op === "+" ? '+' :
    op === "-" ? '-' :
    op === "*" ? '*' :
    op === "/" ? '/' :
    op === ">" ? '>' :
    op === "<" ? '<' :
    op === "=" ? '===' :
    op === "not" ? '!' :
    op === "and" ? '&&' :
    op === "or" ? '||' :
    op === "eq?" ? '===' :
    op === "string=?" ? '===' :
    op === "string?" ? '((x) => (typeof (x) === string))' :
    op === "number?" ? '((x) => (typeof (x) === number))' : 
    op === "boolean?" ? '((x) => (typeof (x) === boolean))' :
    op === "symbol?" ? '((x) => (typeof (x) === symbol))' : 
    ("Bad primitive op " + op)
    

// Done - No modification from class.
const rewriteLet = (exp: LetExp): AppExp => {
    const vars: VarDecl[] = map(((b: Binding) => b.var), exp.bindings)
    const vals: CExp[] = map(((b: Binding) => b.val), exp.bindings)
    return makeAppExp(makeProcExp(vars, exp.body), vals)
}

// TODO
const convertValue = (val: Value): string => 
    isNumber(val) ? val.toString() : // Done
    val === true ? 'true' : // Done
    val === false ? 'false' : // Done
    isString(val) ? `"${val}"` : // Done
    isClosure(val) ? "Closure Not suppurted" : //   TODO
    isPrimOp(val) ? OpToString(val.op) : // Done
    isSymbolSExp(val) ? convertValue(val.val) : // TODO
    isEmptySExp(val) ? "EmptySexp Not suppurted" : // TODO
    isCompoundSExp(val) ? "CompoundExp Not suppurted": // TODO
    val;

// TODO
const convertLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` : // TODO
    isSymbolSExp(le.val) ? `Symbol.for(${convertValue(le.val)})` : // Done
    isCompoundSExp(le.val) ? `'${convertValue(le.val)}` : // TODO
    `${le.val}`;

// Done
const convertProcBody = (body: CExp[]): string => {
    const arr: string[] = map(convertL30, body);
    return arr.length === 1 ? arr[0] : '{' + join('; ')(update(-1, "return " + last(arr) + ';', arr)) + '}'
}

// Done
const convertProcExp = (pe: ProcExp): string => 
    `((${join(',')(map( ((arg: VarDecl) => (arg.var)), pe.args))}) => ${convertProcBody(pe.body)})`

// Done
const convertLetExp = (le: LetExp) : string => 
    convertL30(rewriteLet(le))

// Done
const isAtomicOp = (rator: PrimOp) : boolean =>
    (["+", "-", "*", "/", ">", "<", "=", "and", "or", "eq?", "string=?"].includes(rator.op))

// Done
const convertAppExp = (app: AppExp) : string => 
    (isPrimOp(app.rator) && isAtomicOp(app.rator))?  `(${map(convertL30, app.rands).join(' ' + convertValue(app.rator) + ' ')})` :
    (isPrimOp(app.rator) && (app.rator.op === "not")) ? `(${convertValue(app.rator)}` + `${map(convertL30, app.rands)})` :
    (isPrimOp(app.rator)) ? `(${convertValue(app.rator)} (${(map(convertL30, app.rands)).join(',')}))` :
    `${convertL30(app.rator)}(${join(',')(map(convertL30, app.rands))})`


// Done
const convertL30 = (exp: Program | Exp): string => 
    isBoolExp(exp) ? convertValue(exp.val) : // Done
    isNumExp(exp) ? convertValue(exp.val) : // Done
    isStrExp(exp) ? convertValue(exp.val) : // Done
    isLitExp(exp) ? convertLitExp(exp) : // TODO
    isVarRef(exp) ? exp.var : // Done
    isProcExp(exp) ? convertProcExp(exp) : // Done
    isIfExp(exp) ? `(${convertL30(exp.test)} ? ${convertL30(exp.then)} : ${convertL30(exp.alt)})` : // Done
    isAppExp(exp) ? convertAppExp(exp) : // Done
    isPrimOp(exp) ? OpToString(exp.op) : // Done
    isLetExp(exp) ? convertLetExp(exp) : // Done
    isDefineExp(exp) ? `const ${exp.var.var} = ${convertL30(exp.val)}` : // Done
    isProgram(exp) ? map(convertL30, exp.exps).join(";\n") : // Done
    exp

// Done
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    makeOk(convertL30(exp)) 