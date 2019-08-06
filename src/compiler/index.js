/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options) // 解析器
  if (options.optimize !== false) {
    optimize(ast, options) // 优化器，static 节点
  }
  const code = generate(ast, options) // 代码生成器
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
