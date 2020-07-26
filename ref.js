// 响应式
// const app = document.querySelector('#app')

function defineReactive(obj, key, val) {
  // 递归
  observe(val)
  // 将传入的obj进行访问拦截
  Object.defineProperty(obj, key, {
    get () {
      console.log('get ' + key)
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
      }
    }
  })
}

// function update () {
//   app.innerText = obj.foo
// }

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    // 希望传入obj
    return
  }

  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

function set (obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = {
  foo: 'bar',
  bar: 'bar',
  baz: { a: 1 }
}

// 遍历作响应处理
observe(obj)

obj.foo
obj.foo = 'f00000000'
obj.bar = 'barrrrr'
obj.baz.a = 100

set(obj, 'dong', 'dong')
obj.dong
