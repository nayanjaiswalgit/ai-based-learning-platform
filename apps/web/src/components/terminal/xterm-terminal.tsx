'use client'

import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Card } from '@/components/ui/card'

export function XtermTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    term.open(terminalRef.current)
    fitAddon.fit()

    // Welcome message
    term.writeln('Welcome to AI Learn Terminal!')
    term.writeln('Type commands to interact with the environment.')
    term.writeln('')
    term.write('$ ')

    let currentLine = ''

    term.onData((data) => {
      if (data === '\r') {
        // Enter key
        term.write('\r\n')
        if (currentLine.trim()) {
          handleCommand(currentLine)
        }
        currentLine = ''
        term.write('$ ')
      } else if (data === '\u007F') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          term.write('\b \b')
        }
      } else {
        currentLine += data
        term.write(data)
      }
    })

    function handleCommand(command: string) {
      // Simulate command execution
      switch (command.toLowerCase()) {
        case 'help':
          term.writeln('Available commands:')
          term.writeln('  help    - Show this help message')
          term.writeln('  clear   - Clear the terminal')
          term.writeln('  date    - Show current date and time')
          term.writeln('  whoami  - Show current user')
          break
        case 'clear':
          term.clear()
          break
        case 'date':
          term.writeln(new Date().toString())
          break
        case 'whoami':
          term.writeln('student')
          break
        default:
          term.writeln(`bash: ${command}: command not found`)
      }
    }

    termRef.current = term

    return () => {
      term.dispose()
    }
  }, [])

  return (
    <Card className="overflow-hidden bg-[#1e1e1e] p-4">
      <div ref={terminalRef} className="h-[600px]" />
    </Card>
  )
}
