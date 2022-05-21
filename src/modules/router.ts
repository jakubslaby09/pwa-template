import { animations } from "./animations"
import * as sounds from "./sound"

fixFetch()

//self.caches?.delete('views') // delete on refresh


const path = {
    get root() {
        let path = new URL(
            (document.querySelector('head > link[rel="root"]')?.getAttribute('href') ?? '/'),
            location.href
        ).pathname
        if(path.slice(-1) == '/') path = path.slice(0, -1)
        return path
    },
    get pathname(): string { // e.g. /example?123/item?2/details
        return location.pathname.replace(path.root, '')
        + location.search
    },
}

Object.defineProperty(location, 'params', { get() {
    let params = { }
    
    path.pathname.split('/').forEach(pair => {
        const page = pair.split('?')[0]
        const param = pair.split('?')[1]
        if(param) params = {
            ...params,
            [page]: decodeURIComponent(param)
        }
    })

    return params
}})

const elements = {
    get mains() { return document.querySelectorAll('body > main') },
    get main() { return this.mains[this.mains.length - 1] as HTMLElement },
    nav: document.querySelector('body > nav') as HTMLElement,
    links: document.querySelectorAll('body > nav > [page]'),
    header: document.querySelector('body > header') as HTMLElement,
}

const stack = {
    _bottom: 'home',

    get values() {
        return [
            this._bottom,
            ...path.pathname
                .split('/')
                .filter(n => n != '')
                .map(layer => layer.split('?')[0])
        ]
    },

    push(view: string) {
        history.pushState(null, '', `${location.href}/${view}`)
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

        if(elements.mains.length > this.values.length) {
            elements.main.remove()
            animations.land(elements.main)
        }
        
        else animations.open(elements.main)
        await insert(this.top, !!this.bottom)
        activateLinks(this.top)
        console.timeEnd('applystack')
        
        
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
    if(!bottom && elements.main.children.length) return
    const page = await request(`/views/${view}.html`)

    const main = page.match(/(<main>|<main\s([\s\S]*?)>)([\s\S]*?)<\/main>/)

    if(main) elements.main.outerHTML = main[0]
    else elements.main.innerHTML = page

    
    if(!bottom) {
        const header = elements.main.querySelector('header')
        if(!header) return

        header.prepend(document.createElement('button'))
        header.children[0]!.outerHTML = '<button icon navback>arrow_back</button>'
        header.children[0]!.addEventListener('click', () => history.back())
    }
}

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
        
        const url = new URL(
            input.slice(1),
            location.origin + path.root + '/'
        ).href
        return oldFetch(url, init)
    }
}