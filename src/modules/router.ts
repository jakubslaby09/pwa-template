const main = document.querySelector('body > main')
const nav = document.querySelector('body > nav')
const links = document.querySelectorAll('body > nav > [page]')

caches.delete('pages') // reset on reload
const cache = /* await */ caches.open('pages')

links.forEach(link => link.addEventListener('click', async () => {
  await page(link.getAttribute('page')!)
}))

export async function page(page: string) {
  main?.removeAttribute('afterload')
  main!.innerHTML = await request(`/views/${page}.html`)

  // 'active' attributes
  document.querySelectorAll('[page]').forEach(
    e => e.getAttribute('page') == page
      ? e.setAttribute('active', '')
      : e.removeAttribute('active')
  )
  main?.setAttribute('afterload', '')
}

async function request(url: string) {
  let res = await (await cache).match(url)
  if(!res) {
    console.log(`%c Downloading ${url}`, 'color: royalblue')
    nav?.setAttribute('loading', '')
    await (await cache).put(url, await fetch(url))
    nav?.removeAttribute('loading')
    res = (await (await cache).match(url))!
  }
  
  return await res.text()
}