import { append, join, last, map, reduce, split, update } from 'ramda';
import { AppExp, Binding, CExp, Exp, isAppExp, isBoolExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, LetExp, LitExp, makeAppExp, makeProcExp, PrimOp, ProcExp, Program, VarDecl } from '../imp/L3-ast';
import { SymbolSExp, isSymbolSExp, Value, isClosure, isEmptySExp, isCompoundSExp, Closure, CompoundSExp } from '../imp/L3-value';
import { Result, makeFailure, makeOk } from '../shared/result';
import { isArray, isNumber, isString } from '../shared/type-predicates';

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
    op === "string?" ? '((x) => (typeof(x) === string))' :
    op === "number?" ? '((x) => (typeof(x) === number))' : 
    op === "boolean?" ? '((x) => (typeof(x) === boolean))' :
    op === "symbol?" ? '((x) => (typeof(x) === symbol))' : 
    ("Bad primitive op " + op)
    

// Done - No modification from class.
const rewriteLet = (exp: LetExp): AppExp => {
    const vars: VarDecl[] = map(((b: Binding) => b.var), exp.bindings)
    const vals: CExp[] = map(((b: Binding) => b.val), exp.bindings)
    return makeAppExp(makeProcExp(vars, exp.body), vals)
}

// TODO
const unparseValue = (val: Value): string => 
    isNumber(val) ? val.toString() : // Done
    val === true ? 'true' : // Done
    val === false ? 'false' : // Done
    isString(val) ? `"${val}"` : // Done
    isClosure(val) ? "Closure Not suppurted" : // closureToString(val) :  TODO
    isPrimOp(val) ? OpToString(val.op) : // Done
    isSymbolSExp(val) ? unparseValue(val.val) : // TODO
    isEmptySExp(val) ? "EmptySexp Not suppurted" : // TODO
    isCompoundSExp(val) ? "CompoundExp Not suppurted": // compoundSExpToString(val) : TODO
    val;

// TODO
const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` : // TODO
    isSymbolSExp(le.val) ? `Symbol.for(${unparseValue(le.val)})` : // Done
    isCompoundSExp(le.val) ? `'${unparseValue(le.val)}` : // TODO
    `${le.val}`;

// Done
const unparseProcBody = (body: CExp[]): string => {
    const arr: string[] = map(unparseL3, body);
    return arr.length === 1 ? arr[0] : '{' + join('; ')(update(-1, "return " + last(arr) + ';', arr)) + '}'
}

// Done
const unparseProcExp = (pe: ProcExp): string => 
    `((${join(',')(map( ((arg: VarDecl) => (arg.var)), pe.args))}) => ${unparseProcBody(pe.body)})`

// Done
const unparseLetExp = (le: LetExp) : string => 
    unparseL3(rewriteLet(le))

// Done
const isAtomicOp = (rator: PrimOp) : boolean =>
    (["+", "-", "*", "/", ">", "<", "=", "and", "or", "eq?", "string=?"].includes(rator.op))

// Done
const unparseAppExp = (app: AppExp) : string => 
    (isPrimOp(app.rator) && isAtomicOp(app.rator))?  `(${map(unparseL3, app.rands).join(' ' + unparseValue(app.rator) + ' ')})` :
    (isPrimOp(app.rator) && (app.rator.op === "not")) ? `(${unparseValue(app.rator)}` + `${map(unparseL3, app.rands)})` :
    (isPrimOp(app.rator)) ? `(${unparseValue(app.rator)} (${(map(unparseL3, app.rands)).join(',')}))` :
    `${unparseL3(app.rator)}(${join(',')(map(unparseL3, app.rands))})`

// Done
const unparseProgram =(exp: Program): string => {
    const arr = map(unparseL3, exp.exps)
    return update(-1, `console.log(${last(arr)})`, arr).join(";\n") + ';'
}

// Done
const unparseL3 = (exp: Program | Exp): string => 
    isBoolExp(exp) ? unparseValue(exp.val) : // Done
    isNumExp(exp) ? unparseValue(exp.val) : // Done
    isStrExp(exp) ? unparseValue(exp.val) : // Done
    isLitExp(exp) ? unparseLitExp(exp) : 
    isVarRef(exp) ? exp.var : // Done
    isProcExp(exp) ? unparseProcExp(exp) :
    isIfExp(exp) ? `(${unparseL3(exp.test)} ? ${unparseL3(exp.then)} : ${unparseL3(exp.alt)})` : // Done
    isAppExp(exp) ? unparseAppExp(exp) : // Done
    isPrimOp(exp) ? OpToString(exp.op) : // Done
    isLetExp(exp) ? unparseLetExp(exp) : // Done
    isDefineExp(exp) ? `const ${exp.var.var} = ${unparseL3(exp.val)}` : // Done
    isProgram(exp) ? unparseProgram(exp) : // Done
    exp

// Done
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    makeOk(unparseL3(exp)) 

























    
// const closureToString = (c: Closure): string =>
//     // `<Closure ${c.params} ${L3unparse(c.body)}>`
//     `<Closure ${c.params} ${c.body}>` 

// const compoundSExpToArray = (cs: CompoundSExp, res: string[]): string[] | { s1: string[], s2: string } =>
//     isEmptySExp(cs.val2) ? append(unparseValue(cs.val1), res) :
//     isCompoundSExp(cs.val2) ? compoundSExpToArray(cs.val2, append(unparseValue(cs.val1), res)) :
//     ({ s1: append(unparseValue(cs.val1), res), s2: unparseValue(cs.val2)})


// const compoundSExpToString = (cs: CompoundSExp, css = compoundSExpToArray(cs, [])): string => 
//     isArray(css) ? `(${css.join(' ')})` :
//     `(${css.s1.join(' ')} . ${css.s2})` // TODO
