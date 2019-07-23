/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&') // 字符串的正则需要加上 \\ 来保留原字符，[[ -> \\[\\[
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g') // 开闭之间的任何东西，包括换行，dotAll 很有必要吧，[嘿哈]
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

export function parseText (
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = [] // 拆解表达式裹一层函数，`hello, {{msg}}` -> 'hello' + _s(mes)， 当然delimiters是自定义的
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0 // 修正lastIndex， 让exec从头开始搜
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index)) // 取出一组表达式
      tokens.push(JSON.stringify(tokenValue)) // 匹配到的文本外层裹一对双引号 ""
    }
    // tag token
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`) // 为表达式包裹toString函数
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length // TODO 为什么不直接使用tagRE.lastIndex的值，测试完之后发现的确一致（已提 PR ）
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

/* @Snippet
function parseText (
  text
){
  const tagRE =  new RegExp(/\[\[((?:.|\n)+?)\]\]/, 'g')
  if (!tagRE.test(text)) {
    return
  }
  const tokens = [] // 拆解表达式裹一层函数，`hello, {{msg}}` -> 'hello' + _s(mes)， 当然delimiters是自定义的
  const rawTokens = []
  let lastIndex = tagRE.lastIndex = 0 // 修正lastIndex， 让exec从头开始搜
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index)) // 取出一组表达式
      tokens.push(JSON.stringify(tokenValue)) // 匹配到的文本外层裹一对双引号 ""
    }
    // tag token
    const exp = match[1].trim()
    tokens.push(`_s(${exp})`) // 为表达式包裹toString函数
    rawTokens.push({ '@binding': exp })
//     lastIndex = index + match[0].length
    lastIndex = tagRE.lastIndex;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

parseText("你好呀 [[ssddds]] 小伙子 [[a]]")
 */
