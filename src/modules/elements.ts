const conditions = {
    ripple(e: Element) {
        return !!e.getAttribute('ripple')
            || !!e.getAttribute('page')
            || false
    }
}

const modifications: Modification[] = [
    {
        if: conditions.ripple,
        then(e) {
            console.log(e);
            e.addEventListener('pointerdown', () => {
                e.removeAttribute('afterclick')
                setTimeout(() => 
                    e.setAttribute('afterclick', '')
                , 0)
            })
        }
    }
]



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
}