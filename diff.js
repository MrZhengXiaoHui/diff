// h 函数
function h(sel, data, params) {
    // h函数的 第三个参数是字符串类型【意味着没有子元素】
    if (typeof params === 'string') {
        return vnode(sel, data, undefined, params, undefined);
    }
    // h函数的 第三个参数是数组类型【意味着有子元素】
    if (Array.isArray(params)) {
        let children = params.slice();
        return vnode(sel, data, children, undefined, undefined);
    }
}
// vnode函数 转换成vdom结构
function vnode(sel, data, children, text, elm) {
    let key = data.key;
    return {
        sel, data, children, text, elm, key
    }
}
// patch函数  
function patch(oldVnode, newVonde) {
    // 如果oldVnode 没有sel，就证明是非虚拟节点
    if (oldVnode.sel == undefined) {
        // 转化成vdom结构
        oldVnode = vnode(oldVnode.localName, {}, [], undefined, oldVnode);
    }

    // 判断旧的虚拟节点和新的虚拟节点是不是同一个节点
    if (oldVnode.sel === newVonde.sel) {
        pathVnode(oldVnode, newVonde)
    } else {// 不是同一个节点，那么就暴力删除旧的节点，创建插入新的节点

        // 把新的虚拟节点 创建为dom节点
        let newVnodeElm = createElement(newVonde);

        // 获取旧节点，.elm 就是真实节点
        let oldElm = oldVnode.elm;

        // 创建新的节点
        if (newVnodeElm) {
            oldElm.parentNode.insertBefore(newVnodeElm, oldElm)
        }

        // 删除旧节点
        oldElm.parentNode.removeChild(oldElm);
    }
}

// createElement函数 创建dom节点
function createElement(vnode) {
    let domNode = document.createElement(vnode.sel);
    // 判断有没有子节点 children是不是为undefined
    if (vnode.children === undefined) {
        domNode.innerText = vnode.text
    }
    if (Array.isArray(vnode.children)) {// 新的节点有children

        // 说明内部有子节点，需要递归创建节点
        for (let child of vnode.children) {
            let childDom = createElement(child);
            domNode.appendChild(childDom);
        }
    }
    // 补充elm属性
    vnode.elm = domNode;
    return domNode;
}

// pathVnode函数 虚拟节点和新的虚拟节点是同一个节点
function pathVnode(oldVnode, newVonde) {

    // 判断新节点有没有children
    if (newVonde.children === undefined) { // 新的没有子节点
        // 新节点的文本和旧节点的文本是不是一样的
        if (newVonde.text !== oldVnode.text) {
            oldVnode.elm.innerText = newVonde.text;
        }
    } else {// 新的有子节点
        // 新的虚拟节点有 旧的虚拟节点有
        if (oldVnode.children !== undefined && oldVnode.children.length > 0) {
            updateChildren(oldVnode.elm, oldVnode.children, newVonde.children)
        } else {// 新的虚拟节点有 旧的虚拟节点没有

            // 把旧节点的内容清空
            oldVnode.elm.innerHTML = '';
            // 遍历新的 子节点，创建dom元素，添加到页面中
            for (let child of vnode.children) {
                let childDom = createElement(child);
                oldVnode.elm.appendChild(childDom);
            }
        }

    }
}

// 对比新旧子节点并更新  parentElm为真实dom节点
function updateChildren(parentElm, oldCh, newCh) {

    // 判断两个虚拟节点是否为同一个节点
    function sameVnode(vNode1, vNode2) {
        return vNode1.key === vNode2.key
    }

    let oldStartIdx = 0; // 旧前的指针
    let oldEndIdx = oldCh.length - 1; // 旧后的指针
    let newStartIdx = 0; // 新前的指针
    let newEndIdx = newCh.length - 1; // 新后的指针

    let oldStartVnode = oldCh[0]; // 旧前虚拟节点
    let oldEndVnode = oldCh[oldEndIdx]; // 旧后虚拟节点
    let newStartVnode = newCh[0]; // 新前虚拟节点
    let newEndVnode = newCh[newEndIdx]; // 新后虚拟节点


    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == undefined) {
            oldStartVnode = oldCh[++oldStartIdx];

        } else if (oldEndVnode == undefined) {
            oldEndVnode = oldCh[--oldEndIdx];

        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            console.log(1)
            // 第一种 旧前 和 新前
            pathVnode(oldStartVnode, newStartVnode);
            if (newStartVnode) newStartVnode.elm = oldStartVnode?.elm;
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            console.log(2)
            // 第二种 旧后 和 新后
            pathVnode(oldEndVnode, oldEndVnode);
            if (newEndVnode) newEndVnode.elm = oldEndVnode?.elm;
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            console.log(3)
            // 第三种 旧前 和 新后
            pathVnode(oldStartVnode, newEndVnode);
            if (newEndVnode) newEndVnode.elm = oldStartVnode?.elm;

            //把旧前指定的节点移动到旧后指向的节点的后面
            parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);

            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            console.log(4)
            // 第四种 旧后 和 新前
            pathVnode(oldEndVnode, newStartVnode);
            if (newStartVnode) newStartVnode.elm = oldEndVnode?.elm;

            //把旧后指定的节点移动到旧前指向的节点的前面
            parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);

            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            console.log(5)
            // 第五种 以上都不满足添加 --> 查找
            // 创建一个对象，存虚拟节点（判断新旧有没有相同节点）
            const keyMap = {};
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                const key = oldCh[i]?.key;
                if (key) keyMap[key] = i;
            }
            // 在旧节点中寻找新前指向的节点
            let idxInOld = keyMap[newStartVnode.key];
            // 如果有，说明数据在新旧虚拟节点中都存在
            if (idxInOld) {
                const elmMove = oldCh[idxInOld];
                pathVnode(elmMove, newStartVnode);
                // 处理过的节点，在旧虚拟节点的数组中，设置为undefind
                oldCh[idxInOld] = undefined;
                console.log(1)
                parentElm.insertBefore(elmMove.elm, oldStartVnode.elm)
            } else {
                // 如果没有找到--> 说明是一个新的节点【创建】
                parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.elm)
            }
            // 新数据（指针）+1
            newStartVnode = newCh[++newStartIdx];
        }
    }

    // 结束while 只有两种情况 （新增和删除）
    // 1. oldStartIdx > oldEndIdx
    // 2. newStartIdx > newEndIdx
    if (oldStartIdx > oldEndIdx) {
        const before = newCh[newEndIdx + 1] ? newCh[newEndIdx + 1] : null
        for (let i = newStartIdx; i <= newEndIdx; i++) {
            parentElm.insertBefore(createElement(newCh[i]), before)
        }
    } else {
        // 进入删除操作
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
            parentElm.removeChild(oldCh[i].elm)
        }
    }
}