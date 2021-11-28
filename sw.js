self.addEventListener('install', async e => {
    // e.skipWaiting()
})

self.addEventListener('fetch', event => {
    const req = event.request
    if(req.method != 'GET') return
    
    
    async function respond() {
        const cache = {
            views: await caches.open('views'),
            app: await caches.open('app'),
            dep: await caches.open('dep')
        }
        
        const type = req.url.startsWith(location.origin) ? (
            req.url.includes('views/') ? 'views' : 'app'
        ) : 'dep'
        const cached = await cache[type].match(req.url)
        
        if(cached) {
            //console.log(`%c✔️ from cache:  ${req.url}`, 'color: orange');
            return cached
        } else {
            console.log(`%cDownloading  ${req.url}`, 'color: royalblue');
            const res = await fetch(req)
            if(res.status != 206) cache[type].put(req, res.clone())
            else console.log(`%c✖ cannot cache partial request ${req.url}`, 'color: orange');
            return res
        }
    }
    
    event.respondWith(respond())
})

self.addEventListener('message', async e => {
    if(e.data == 'update') {
        console.log('%cClearing caches', 'color: orange');
        (await caches.keys()).forEach(key => {
            caches.delete(key)
            console.log(`%c✔️ cleared ${key}`, 'color: orange');
        })
        e.source.postMessage('update')
    }
})