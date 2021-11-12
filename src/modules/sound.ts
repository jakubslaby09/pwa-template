export const sounds = {
    tap: new Audio('sounds/tap1.wav'),
    navForward: new Audio('sounds/nav1.flac'),
    navBackward: new Audio('sounds/nav2.flac'),
    refresh: new Audio('sounds/refresh.flac'),
    shutter: new Audio('sounds/shutter.flac'),
}
sounds.tap.volume = 0.5
sounds.navForward.volume = 0.1
sounds.navBackward.volume = 0.2
sounds.shutter.volume = 0.05

export function tap() {
    sounds.tap.play()
    //navigator.vibrate([0, 150, 5])
}

export function refresh() {
    sounds.refresh.play()
}

export function shutter() {
    sounds.shutter.play()
}

export function navigate(forward = true, stack = false) {
    navigator.vibrate(stack ? 20 : 15)
    if(forward) sounds.navForward.play()
    else sounds.navBackward.play()
}