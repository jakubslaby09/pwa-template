export const sounds = {
    tap: new Audio('/sounds/tap1.wav'),
    navForward: new Audio('/sounds/nav1.wav'),
    refresh: new Audio('/sounds/refresh.wav'),
    shutter: new Audio('/sounds/shutter.wav'),
}
sounds.navForward.volume = 0.1
sounds.shutter.volume = 0.05

export function tap() {
    sounds.tap.play()
}

export function refresh() {
    sounds.refresh.play()
}

export function shutter() {
    sounds.shutter.play()
}

export function navigate(forward = true) {
    if(forward) sounds.navForward.play()
}