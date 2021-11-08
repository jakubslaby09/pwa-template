import { navigate } from "./sound"

const elements = {
    main: document.querySelector('body > main') as HTMLElement,
    nav: document.querySelector('body > nav') as HTMLElement,
    links: document.querySelectorAll('body > nav > [page]'),
}

//self.caches?.delete('views') // delete on refresh

export async function go(page: string) {
    elements.main.removeAttribute('afterload')
    elements.main.innerHTML = await request(`/views/${page}.html`)
    
    document.querySelectorAll('[page]').forEach(
        e => e.getAttribute('page') == page
            ? e.setAttribute('active', '')
            : e.removeAttribute('active')
    )
    elements.main.setAttribute('afterload', '')
}

elements.links.forEach(link => link.addEventListener('click', () => {
    go(link.getAttribute('page')!)
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