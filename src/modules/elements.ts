import stack from "./router"
import { tap } from "./sound"

const conditions = {
    ripple(e: Element) {
        return e.getAttribute('ripple') != null
            || e.getAttribute('page') != null
            || e.nodeName == 'BUTTON'
            || e.nodeName == 'HEADER'
            /* || (e.nodeName == 'INPUT'
                && e.getAttribute('type') == 'submit'
            ) */
            || false
    },
    dialog(e: Element) {
        return e.nodeName == 'DIALOG'
    },
    view(e: Element) {
        return !!e.getAttribute('view')
    },
    page(e: Element) {
        return !!e.getAttribute('page')
    },
    textfield(e: Element) {
        return e.nodeName == 'TEXTFIELD'
    }
}

const modifications: Modification[] = [
    {
        if: conditions.ripple,
        then(e) {
            e.addEventListener('pointerdown', () => ripple(e))
            e.addEventListener('keydown', event => {
                if((event as KeyboardEvent).key == 'Enter')
                    ripple(e, 10)
            })
        }
    },
    {
        if: conditions.dialog,
        then(e) {
            e.setAttribute('open', '')
        }
    },
    {
        if: conditions.view,
        then(e: HTMLElement) {
            e.onclick = (() => {
                const name = e.getAttribute('view')
                if(!name) return
                stack.push(name)
            })
        }
    },
    {
        if: conditions.page,
        then(e: HTMLElement) {
            e.onclick = () => {
                const name = e.getAttribute('page')
                if(!name) return
                stack.bottom = name
            }
        }
    },
    {
        if: conditions.textfield,
        then(e: HTMLElement) {
            e.setAttribute('contenteditable', '')

            const update = async () => e.innerText == ''
            ?  e.setAttribute('empty', '')
            :  e.removeAttribute('empty')

            update()
            e.oninput = update
            /* e.onchange = () => console.log('test'); */
            /* const root = e.attachShadow({
                mode: 'closed'
            }) */
        }
    },
]


function ripple(element: Element, delay: number = 0) {
    if(element.getAttribute('disabled') != null) return
    element.removeAttribute('afterclick')
                setTimeout(() => 
                    element.setAttribute('afterclick', '')
                , delay)
    tap()
}

interface Modification {
    if: (e: Element) => boolean
    then: (e: Element) => void
}

const observer = new MutationObserver(records => {
    records.forEach(record => {
        record.addedNodes.forEach(
            node => node.nodeName != '#text' ? 
                initnode(node as Element) : 0
        )
    })
})

observer.observe(document.body, {
    childList: true,
    subtree: true
})

document.querySelectorAll('body *').forEach(node => initnode(node))

function initnode(element: Element) {
    modifications.forEach(m => {
        if(m.if(element)) m.then(element)
    })

    for(const i in element.children) {
        const child = element.children[i]
        if(!!child.getAttribute) initnode(child)
    }
}