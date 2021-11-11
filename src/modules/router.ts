const root = location.origin
        + document.querySelector('head > link[rel="root"]')?.getAttribute('href') ?? '/'
fixFetch()

import { cleanup } from "./elements"
import { navigate } from "./sound"

//self.caches?.delete('views') // delete on refresh

const elements = {
    main: document.querySelector('body > main') as HTMLElement,
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
    get first() {
        return this._values.length == 1 ? this._values[0] : null
    },
    get current() {
        return this.first?.page ?? this._values[this._values.length - 1]
    },
    back() {
        if(this.first) return
        this._values.pop()
        history.back()
        go(this.current)
    },
    async open(view: string) {
        this._values.push(view)
        history.pushState(view, '', root + this._values.slice(1).join('/'))
        console.log(this._values);
        
        await go(view)
    }
};
(window as any).stack = stack

window.onpopstate = () => stack.back()

go(stack.current)

async function go(view: string) {
    document.body.removeAttribute('fullview')

    elements.main.removeAttribute('afterload')
    elements.main.innerHTML = await request(`/views/${view}.html`)

    document.querySelectorAll('[page]').forEach(
        e => e.getAttribute('page') == view
            ? e.setAttribute('active', '')
            : e.removeAttribute('active')
    )
    elements.main.setAttribute('afterload', '')

    if(!stack.first) {
        document.body.setAttribute('fullview', '')
        cleanup()
    
        const viewheader = elements.main.querySelector('header')
        if(viewheader) viewheader.innerHTML = 
            `<button icon navback>arrow_back</button>` + viewheader?.innerHTML;
        (viewheader?.querySelector('[navback]') as HTMLElement).onclick = () => stack.back()
    }
}

elements.links.forEach(link => link.addEventListener('click', () => {
    if(stack.first) stack.first.page = link.getAttribute('page')!
    navigate()
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
        const path = new URL('.' + input, root).href
        return oldFetch(path, init)
    }
}