/**
 * @file 不同属性变更时，需要触发的钩子函数
 */
import attrs from './attrs'
import klass from './class'
import events from './events'
import domProps from './dom-props'
import style from './style'
import transition from './transition'

export default [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
]
