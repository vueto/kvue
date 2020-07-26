function defineReactive(obj, key, val) {
  // 递归
  observe(val)

  // 创建一个Dep和当前的key一一对应
  const dep = new Dep()

  // 将传入的obj进行访问拦截
  Object.defineProperty(obj, key, {
    get () {
      console.log('get ' + key)
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set (newVal) {
      if (newVal !== val) {
        console.log('set ' + key + ':' + newVal)
        val = newVal
        // 如果传入的值依然是newVal,则需处理
        observe(newVal)
        // 更新函数，用于界面更新
        // update()

        dep.notify()
      }
    }
  })
}

// 代理函数方便用户直接访问$data中的数据
function proxy(vm, sourceKey) {
  console.log(vm[sourceKey])
  // vm[sourceKey]就是vm[$data]
  Object.keys(vm[sourceKey]).forEach(key => {
    // 将$data中的key代理到vm属性中
    Object.defineProperty(vm, key, {
      get() {
        return vm[sourceKey][key]
      },
      set(newVal) {
        vm[sourceKey][key] = newVal
      }
    })
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    // 希望传入obj
    return
  }

  // 创建observer实例
  new Observer(obj)
}

class KVue {
  constructor (options){
    // 保存选项
    this.$options = options
    this.$data = options.data

    // 响应化处理
    observe(this.$data)

    // 代理
    proxy(this, '$data')

    // 创建编译器
    new Compiler(options.el, this)
  }
}

// 根据对象的类型决定如何执行响应化
class Observer {
  constructor (value) {
    this.value = value 

    // 判断类型
    if (typeof value === 'object') {
      this.walk(value)
    }
  }

  // 对象数据的响应化
  walk (obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }

  // 数组数据的响应化
}

// 观察者：保存更新函数，值发生变化调用更新函数
// const watcher = [] 
class Watcher {
  constructor (vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // watcher.push(this)

    // Dep的静态属性上设置为当前wacher实例
    Dep.target = this
    this.vm[this.key] // 读取触发getter
    Dep.target = null // 收集完就置空
  }

  update() {
    this.updateFn.call(this.$vm, this.vm[this.key])
  }
}

// Dep依赖收集，管理某个key相关的所有watcher实例
class Dep {
  constructor () {
    this.deps = []
  }

  addDep (dep) {
    this.deps.push(dep)
  }

  notify () {
    this.deps.forEach(dep => dep.update())
  }
}