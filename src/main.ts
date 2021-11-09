import './style.css'
import './modules/elements'
import './modules/router'
import './modules/offline'
import { go } from './modules/router'
import * as sounds from './modules/sound'

(window as any).sounds = sounds

go('home')