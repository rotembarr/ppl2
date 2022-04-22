import {  Exp, isExp, Program, isProgram, isLetStarExp, LetStarExp, LetExp, makeLetExp, makeLetStarExp, makeProgram, isDefineExp, makeDefineExp, CExp, isCExp, isAppExp, isIfExp, makeIfExp, isProcExp, makeProcExp, isBinding, makeBinding, Binding, isLetExp, makeAppExp } from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { map } from "ramda";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31BindingToL3Binding = (bind: Binding): Binding => 
    makeBinding(bind.var.var, L31CExpToL3CExp(bind.val))


export const LetStarToLet = (exp: LetStarExp): LetExp =>  
    (exp.bindings.length <= 1) ? 
        makeLetExp(map(L31BindingToL3Binding, exp.bindings), map(L31CExpToL3CExp,exp.body)) :
        makeLetExp([L31BindingToL3Binding(exp.bindings[0])], [LetStarToLet(makeLetStarExp(exp.bindings.slice(1), exp.body))]) 


export const L31CExpToL3CExp = (exp: CExp): CExp =>  
    (isAppExp(exp))     ? makeAppExp(L31CExpToL3CExp(exp.rator), map(L31CExpToL3CExp, exp.rands)) :
    (isIfExp(exp))      ? makeIfExp(L31CExpToL3CExp(exp.test), L31CExpToL3CExp(exp.then), L31CExpToL3CExp(exp.alt)) :
    (isProcExp(exp))    ? makeProcExp(exp.args, map(L31CExpToL3CExp, exp.body)) :
    (isLetExp(exp))     ? makeLetExp(map(L31BindingToL3Binding, exp.bindings), map(L31CExpToL3CExp, exp.body)) :
    (isLetStarExp(exp)) ? LetStarToLet(exp) :
    exp; 


export const L31ExpToL3Exp = (exp: Exp): Exp => 
    (isDefineExp(exp))  ? makeDefineExp(exp.var, L31CExpToL3CExp(exp.val)) :
    L31CExpToL3CExp(exp) // (isCExp(exp)) 
    

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => 
    (isProgram(exp))    ? makeOk(makeProgram(map(L31ExpToL3Exp, exp.exps))) :
    (isExp(exp))        ? makeOk(L31ExpToL3Exp(exp)) :
    makeFailure("Balagan"); 
