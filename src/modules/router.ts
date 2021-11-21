const root = location.origin
        + (document.querySelector('head > link[rel="root"]')?.getAttribute('href') ?? '/')
fixFetch()

import { cleanup } from "./elements"
import * as sounds from "./sound"

//self.caches?.delete('views') // delete on refresh

const elements = {
    get mains() { return document.querySelectorAll('body > main') },
    get main() { return this.mains[this.mains.length - 1] as HTMLElement },
    nav: document.querySelector('body > nav') as HTMLElement,
    links: document.querySelectorAll('body > nav > [page]'),
    header: document.querySelector('body > header') as HTMLElement,
}

export const stack = {
    _values: [
        {
            _page: 'home',
            get page() {
                return this._page
            },
            set page(page) {
                this._page = page
                go(page)
            },
        },
        ...location.href.replace(root, '').split('/').filter(view => view != '')
    ] as string[] & [{ page: string, _page: string }],
    get bottom() {
        return this._values.length == 1 ? this._values[0] : null
    },
    apply() {
        this._values.forEach((view, i) => {
            if(i == 0) return
            if(elements.mains[i]) return
            elements.main.insertAdjacentHTML(
                'afterend', '<main></main>'
            )
            go(view, i)
        })
        if(this.bottom) go(this.bottom.page)
        
        cleanup('afterload')
    },
    onback() {
        if(this.bottom) return
        sounds.navigate(false, true)
        elements.main.remove()
        this._values.pop()
        this.apply()
    },
    async push(view: string) {
        sounds.navigate(true, true)
        this._values.push(view)
        history.pushState(view, '', root + this._values.slice(1).join('/'))
        console.log(this._values);
        
        await this.apply()
    },
};
(window as any).stack = stack
window.onpopstate = () => stack.onback()
stack.apply()

async function go(view: string, layer = 0) {
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
    if(stack.bottom) stack.bottom.page = link.getAttribute('page')!
    sounds.navigate()
}))

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
        
        const path = new URL(input, root).href
        return oldFetch(path, init)
    }
}