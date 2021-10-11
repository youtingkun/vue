/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// Dep类是为了让每一个监测对象都有多个watcher实例，用subs数组来存储
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  //向dep的观察者列表subs添加观察者
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  //从dep的观察者列表subs移除观察者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  //依赖收集：如果当前有观察者，将该dep放进当前观察者的deps中
  //同时，将当前观察者放入观察者列表subs中
  //这里的Dep.target就是Watcer实例，this是Dep的实例
  depend () {
    if (Dep.target) {
      console.log("dep.depend()",Dep.target);
      Dep.target.addDep(this)
    }
  }

  // 遍历subs当中的watcher，运行每个观察者的update接口
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
//Dep.target是观察者，这是全局唯一的，因为在任何时候只有一个观察者被处理。
Dep.target = null
//待处理的观察者队列
const targetStack = []

export function pushTarget (target: ?Watcher) {
   //如果当前有正在处理的观察者，将他压入待处理队列
  targetStack.push(target)
  //将Dep.target指向需要处理的观察者
  Dep.target = target
}

export function popTarget () {
  //将栈顶第一项移除
  targetStack.pop()
  //将Dep.target指向栈顶新的观察者，
  Dep.target = targetStack[targetStack.length - 1]
}
