/**
 * 编译器
 * 递归遍历dom树
 * 判断节点类型，如果是文本，则判断是否是插值绑定
 * 如果是元素则遍历其属性是否是指令或事件然后递归子元素
 */

 class Compiler {
   /**
    *Creates an instance of Compile.
    * @param {*} el 宿主元素
    * @param {*} vm KVue实例 
    * @memberof Compile
    */
  constructor(el, vm) {
  this.$vm = vm
  this.$el = document.querySelector(el)

  if (this.$el) {
    // 执行编译
    this.compile(this.$el)
  }
  }

  compile (el) {
    // 遍历el树
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 判断是否是元素 
      if (this.isElement(node)) {
        console.log('编译元素：' + node.nodeName)
        this.compileElement(node)
      } else if (this.isInter(node)) {
        console.log('编译插值绑定：' + node.textContent)
        this.compileText(node)
      }
      // 递归子节点
      if (node.childNodes.length > 0) {
        this.compile(node)
      }
    })

  }

  isElement(node) {
    return node.nodeType === 1
  }

  isInter(node) {
    // 首先是文本标签，其次内容是XXX
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  compileText(node) {
    this.update(node, RegExp.$1, 'text')
  }

  compileElement(node) {
    // 节点是元素
    // 遍历其属性列表
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      // 规定：以k-xxx定义
      const attrName = attr.name
      const exp = attr.value

      if (this.isDirective(attrName)) {
        const dir = attrName.substring(2)
        // 执行指令
        this[dir] && this[dir](node, exp)
      }
    })
  }

  isDirective(attr) {
    return attr.indexOf('k-') === 0
  }

  text (node, exp) {
    this.update(node, exp, 'text')
  }

  html (node, exp) {
    this.update(node, exp, 'html')
  }

  update (node, exp, dir) {
    // 指令对应的更新函数
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 更新处理,更新对应的dom
    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val )
    })
  }

  textUpdater (node, value) {
    node.textContent = value
  }

  htmlUpdater (node, value) {
    node.innerHTML = value
  }
 }