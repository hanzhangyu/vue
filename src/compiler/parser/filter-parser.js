/* @flow */
/**
 * @file gen filter code
 */

const validDivisionCharRE = /[\w).+\-_$\]]/

/**
 *
 * @param exp
 * a | b | c(1,2)
 * @returns {*}
 * _s(
 *    _f("c")(
 *        _f("b")(a),
 *        1,
 *        2
 *    )
 * )
 */
export function parseFilters (exp: string): string {
  let inSingle = false
  let inDouble = false
  let inTemplateString = false
  let inRegex = false
  let curly = 0
  let square = 0
  let paren = 0
  let lastFilterIndex = 0
  let c, prev, i, expression, filters

  // 遍历，根据filter | 标识提取所有filter，找到正确的表达式
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) { // '
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) { // "
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) { // `
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) { // /
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && // pipe |
      exp.charCodeAt(i + 1) !== 0x7C && // 前后没有跟着 |
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren // [a | b] | c 这种情况下，[a | b]才是表达式，TODO 测试覆盖了这里，检查这一组 condition 不符合的情况
    ) {
      if (expression === undefined) { // 第一个 | 前的即为表达式
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  // 如果没有找到 |，说明这个都是表达式
  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(') // 如果存在 （ 说明是一个嵌套的 filter
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    const name = filter.slice(0, i) // 很巧妙的在 c(1,2) 中插入第一个参数
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}` // 嵌套的 filter 只需返回 该层的filter函数 即可
  }
}
