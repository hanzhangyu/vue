import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options) // initMixin
}

// 初始化prototype
initMixin(Vue)
stateMixin(Vue)// 绑定：$set $delete $watch $data $props
eventsMixin(Vue) // 绑定：$on $once $off $emit
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
