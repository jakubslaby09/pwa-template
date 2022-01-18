import * as sounds from "./sound"

const root = location.origin
        + (document.querySelector('head > link[rel="root"]')?.getAttribute('href') ?? '/')
fixFetch()

//self.caches?.delete('views') // delete on refresh

const elements = {
    get mains() { return document.querySelectorAll('body > main') },
    get main() { return this.mains[this.mains.length - 1] as HTMLElement },
    nav: document.querySelector('body > nav') as HTMLElement,
    links: document.querySelectorAll('body > nav > [page]'),
    header: document.querySelector('body > header') as HTMLElement,
}

const animations = {
    async afterload() {
        elements.main.removeAttribute('afterload')
        setTimeout(() => elements.main.setAttribute('afterload', ''), 0)
    },
    async fullview(remove = false) {
        if(remove) document.body.removeAttribute('fullview')
        else document.body.setAttribute('fullview', '')
    }
}

const stack = {
    _bottom: 'home',

    get values() {
        return [
            this._bottom,
            ...location.pathname.split('/').filter(n => n != '')
        ]
    },

    push(view: string) {
        history.pushState(null, '', `${location.pathname.slice(1)}/${view}`)
        sounds.navigate(true, true)
        this.apply()
    },
    
    get bottom() {
        return this.values.length == 1 ? this._bottom : null
    },

    set bottom(page: string | null) {
        if(page && this.values.length == 1) this._bottom = page
        sounds.navigate(true)
        this.apply()
    },

    get top() {
        return this.values[this.values.length - 1]
    },

    get path() {
        return this.values.join('/')
    },

    async apply() {
        console.time('applystack')
        console.log(`%c${this.path}`, 'color: gold')
        
        this.values.forEach(async (_, layer) => {
            if(!elements.mains[layer]) 
                elements.main.insertAdjacentHTML('afterend', '<main/>')
        })

        if(elements.mains.length > this.values.length) 
            elements.main.remove()
            
        else animations.afterload()
        animations.fullview(!!this.bottom)
        activateLinks(this.top)
        insert(this.top, !!this.bottom)
        .then(() => console.timeEnd('applystack'))

        
    }
}
export default stack
;(window as any).stack = stack

stack.apply()
window.onpopstate = () => stack.apply()

async function activateLinks(view: string) {
    document.querySelectorAll('[page]').forEach(
        e => e.getAttribute('page') == view
            ? e.setAttribute('active', '')
            : e.removeAttribute('active')
    )
}

async function insert(view: string, bottom = true) {
    elements.main.innerHTML = await request(`/views/${view}.html`)
    
    if(!bottom) {
        const header = elements.main.querySelector('header')
        if(!header) return

        header.prepend(document.createElement('button'))
        header.children[0]!.outerHTML = '<button icon navback>arrow_back</button>'
        header.children[0]!.addEventListener('click', () => history.back())
        
    }
}

/* async function go(view: string, layer = 0) {
    document.body.removeAttribute('fullview')

    elements.main.removeAttribute('afterload')
    setTimeout(() => elements.main.setAttribute('afterload', ''), 0)
    
    elements.main.innerHTML = await request(`/views/${view}.html`)

    document.querySelectorAll('[page]').forEach(
        e => e.getAttribute('page') == view
            ? e.setAttribute('active', '')
            : e.removeAttribute('active')
    )

    if(!stack.bottom) {
        document.body.setAttribute('fullview', '')
        cleanup('afterclick')
    
        if(layer != 0) {
            const viewheader = elements.mains[layer].querySelector('header')
            if(viewheader) viewheader.innerHTML = 
            `<button icon navback>arrow_back</button>` + viewheader?.innerHTML;
            const navback = viewheader?.querySelector('[navback]') as HTMLElement | undefined
            if(navback) navback.onclick = () => history.back()
        }
    }
}

elements.links.forEach(link => link.addEventListener('click', () => {
    if(stack.bottom) stack.bottom = link.getAttribute('page')!
    sounds.navigate()
})) */

async function request(url: string) {
    const cache = await self.caches?.open('views') as Cache | undefined // compatibility
    let res = await cache?.match(url)
    
    if(!res) {
        elements.nav.setAttribute('loading', '')
        res = await fetch(url)
        elements.nav.removeAttribute('loading')
    }
    return await res.text()
}

function fixFetch() {
    const oldFetch = window.fetch
    window.fetch = (input: RequestInfo, init?: RequestInit) => {
        if(input instanceof Request || !input.startsWith('/')) {
            return oldFetch(input, init)
        }
        
        const path = new URL(input.slice(1), root).href
        return oldFetch(path, init)
    }
}