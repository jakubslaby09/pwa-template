import Alpine from 'alpinejs'
import './style.css'
import './modules/elements'
import './modules/router'
import './modules/offline'
import * as sounds from './modules/sound'

(window as any).sounds = sounds;
(window as any).Alpine = Alpine

Alpine.start()
