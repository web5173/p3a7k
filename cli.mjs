#!/usr/bin/env node
import { H3, serve } from "h3"
import { spawn } from 'child_process'
const PORT = process.env.PORT || 3000
const app = new H3().get("/", () => "⚡️ Tadaa!")
serve(app, { port: PORT })
setTimeout(() => {
    const url = `http://localhost:${PORT}`
    const { command, args } = process.platform === 'darwin'
        ? { command: 'open', args: [url] }
        : process.platform === 'win32'
            ? { command: 'cmd', args: ['/c', 'start', url] }
            : { command: 'xdg-open', args: [url] }
    spawn(command, args, { detached: true, stdio: 'ignore' })
}, 500)