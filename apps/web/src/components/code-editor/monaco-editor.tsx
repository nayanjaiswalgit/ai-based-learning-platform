'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw } from 'lucide-react'

interface MonacoEditorProps {
  defaultValue?: string
  language?: string
  onChange?: (value: string | undefined) => void
  onRun?: () => void
}

export function MonacoEditor({
  defaultValue = '// Write your code here\n',
  language = 'typescript',
  onChange,
  onRun,
}: MonacoEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor
  }

  function handleReset() {
    if (editorRef.current) {
      editorRef.current.setValue(defaultValue)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={onRun}>
            <Play className="mr-2 h-4 w-4" />
            Run Code
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Editor
          height="500px"
          language={language}
          defaultValue={defaultValue}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Card>
    </div>
  )
}
