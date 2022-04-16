import {  Exp, isExp, Program, isProgram, isLetStarExp, LetStarExp, LetExp, makeLetExp, makeLetStarExp, makeProgram, isDefineExp, makeDefineExp, CExp, isCExp, isAppExp, isIfExp, makeIfExp, isProcExp, makeProcExp, isBinding, makeBinding, Binding, isLetExp, makeAppExp } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { map } from "ramda";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31BindingToL3Binding = (bind: Binding): Binding => { 
    return makeBinding(bind.var.var, L31CExpToL3CExp(bind.val))
}

export const LetStarToLet = (exp: LetStarExp): LetExp => { 
    if (exp.bindings.length <= 1) {
        return makeLetExp(exp.bindings, exp.body)
    } else {
        return makeLetExp([L31BindingToL3Binding(exp.bindings[0])], [LetStarToLet(makeLetStarExp(exp.bindings.slice(1), exp.body))])
    }
}

export const L31CExpToL3CExp = (exp: CExp): CExp => { 
    if (isAppExp(exp)) {
        return makeAppExp(L31CExpToL3CExp(exp.rator), map(L31CExpToL3CExp, exp.rands))
    } else if (isIfExp(exp)) {
        return makeIfExp(L31CExpToL3CExp(exp.test), L31CExpToL3CExp(exp.then), L31CExpToL3CExp(exp.alt))
    } else if (isProcExp(exp)) {
        return makeProcExp(exp.args, map(L31CExpToL3CExp, exp.body))
    } else if (isLetExp(exp)) {
        return makeLetExp(map(L31BindingToL3Binding, exp.bindings), map(L31CExpToL3CExp, exp.body))
    } else if (isLetStarExp(exp)) {
        return LetStarToLet(exp)
    } else {
        return exp;
    }
}

export const L31ExpToL3Exp = (exp: Exp): Exp => { 
    if (isDefineExp(exp)) {
        return makeDefineExp(exp.var, L31CExpToL3CExp(exp.val))
    } else { // if (isCExp(exp)) 
        return L31CExpToL3CExp(exp)
    } 
}

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => { 
    if (isProgram(exp)){
        return makeOk(makeProgram(map(L31ExpToL3Exp, exp.exps)))
    } else if (isExp(exp)) {
        return makeOk(L31ExpToL3Exp(exp))
    } else {
        return makeFailure("Balagan");
    }
}
