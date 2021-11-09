export const sounds = {
    tap: new Audio('sounds/tap1.wav'),
    navForward: new Audio('sounds/nav1.wav'),
    refresh: new Audio('sounds/refresh.wav'),
    shutter: new Audio('sounds/shutter.wav'),
}
sounds.tap.volume = 0.5
sounds.navForward.volume = 0.1
sounds.shutter.volume = 0.05

export async function tap() {
    await sounds.tap.play()
    //navigator.vibrate([0, 150, 5])
}

export function refresh() {
    sounds.refresh.play()
}

export function shutter() {
    sounds.shutter.play()
}

export function navigate(forward = true) {
    navigator.vibrate(10)
    if(forward) sounds.navForward.play()
}