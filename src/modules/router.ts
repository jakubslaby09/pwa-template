const main = document.querySelector('body > main')
const nav = document.querySelectorAll('body > nav > [page]')

nav.forEach(link => link.addEventListener('click', async () => {
  await page(link.getAttribute('page')!)
  console.log(link);
}))

export async function page(page: string) {
  main!.innerHTML = await (await fetch(`/views/${page}.html`)).text()
}