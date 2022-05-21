import { tap } from "./sound"

export const animations = {
    ripple(element: Element, delay: number = 0) {
        if(element.getAttribute('disabled') != null) return
        trigger('afterclick', element, delay)
        tap()
    },
    open(e: Element) {
        trigger('afteropen', e)
    },
    land(e: Element) {
        trigger('afterland', e)
    },
} as const //{ [name: string]: (e: Element, delay?: number) => any }


function trigger(name: string, element: Element, delay: number = 0) {
    element.removeAttribute(name)
    setTimeout(() => 
        element.setAttribute(name, '')
    , delay)
}