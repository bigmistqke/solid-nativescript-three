import { render } from '@nativescript-community/solid-js'
import { Application } from '@nativescript/core'
import { document } from 'dominative'
import { App } from './app'
require('@nativescript/canvas-polyfill')

document.body.actionBarHidden = true
document.body.appendChild(document.createElement('ContentView'))

render(App, document.body.firstElementChild)

const create = () => document

Application.run({ create })
