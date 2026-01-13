'use client'

import { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownViewer } from '@/components/ui/markdown-viewer'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link,
  Eye,
  Edit3,
  Minus,
  CheckSquare,
  Columns,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function EnhancedMarkdownEditor({
  value,
  onChange,
  placeholder = '',
  className,
  minHeight = '300px',
}: EnhancedMarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback(
    (before: string, after: string = '', defaultText: string = '') => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end) || defaultText
      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end)

      onChange(newText)

      // Reset cursor position
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + before.length + selectedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange]
  )

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const lines = value.substring(0, start).split('\n')
      const currentLineStart = lines.slice(0, -1).join('\n').length + (lines.length > 1 ? 1 : 0)

      const newText =
        value.substring(0, currentLineStart) +
        prefix +
        value.substring(currentLineStart)

      onChange(newText)

      setTimeout(() => {
        textarea.focus()
        const newCursorPos = currentLineStart + prefix.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [value, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { key, currentTarget } = e
    const { selectionStart } = currentTarget
    const lines = value.substring(0, selectionStart).split('\n')
    const currentLine = lines[lines.length - 1]

    // Auto-complete lists
    if (key === 'Enter') {
      // Check for unordered list
      if (currentLine.match(/^[\*\-\+]\s/)) {
        e.preventDefault()
        const listChar = currentLine[0]
        insertMarkdown('\n' + listChar + ' ', '')
        return
      }
      // Check for ordered list
      const orderedMatch = currentLine.match(/^(\d+)\.\s/)
      if (orderedMatch) {
        e.preventDefault()
        const nextNum = parseInt(orderedMatch[1]) + 1
        insertMarkdown('\n' + nextNum + '. ', '')
        return
      }
      // Check for checkbox
      if (currentLine.match(/^\[[ x]\]\s/)) {
        e.preventDefault()
        insertMarkdown('\n[ ] ', '')
        return
      }
    }

    // Bold shortcut (Ctrl/Cmd + B)
    if ((e.ctrlKey || e.metaKey) && key === 'b') {
      e.preventDefault()
      insertMarkdown('**', '**', 'テキスト')
      return
    }

    // Italic shortcut (Ctrl/Cmd + I)
    if ((e.ctrlKey || e.metaKey) && key === 'i') {
      e.preventDefault()
      insertMarkdown('*', '*', 'テキスト')
      return
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      <div className="border rounded-md bg-gray-50 p-2 space-y-2">
        {/* First row - Text formatting */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-1 pr-2 border-r">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('# ')}
              title="見出し1 (H1)"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('## ')}
              title="見出し2 (H2)"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('### ')}
              title="見出し3 (H3)"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 pr-2 border-r">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('**', '**', 'テキスト')}
              title="太字 (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('*', '*', 'テキスト')}
              title="斜体 (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 pr-2 border-r">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('- ')}
              title="箇条書きリスト"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('1. ')}
              title="番号付きリスト"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('[ ] ')}
              title="チェックボックス"
            >
              <CheckSquare className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('> ')}
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('`', '`', 'コード')}
              title="インラインコード"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('[', '](URL)', 'リンクテキスト')}
              title="リンク"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertAtLineStart('---\n')}
              title="水平線"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Second row - View modes */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            表示モード:
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              title="編集のみ"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              編集
            </Button>
            <Button
              type="button"
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              title="分割表示"
            >
              <Columns className="w-4 h-4 mr-1" />
              分割
            </Button>
            <Button
              type="button"
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              title="プレビューのみ"
            >
              <Eye className="w-4 h-4 mr-1" />
              プレビュー
            </Button>
          </div>
        </div>
      </div>

      {/* Editor and Preview Area */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'split' && 'grid-cols-2',
        viewMode === 'edit' && 'grid-cols-1',
        viewMode === 'preview' && 'grid-cols-1'
      )}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="relative border rounded-md bg-white">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'font-mono text-sm resize-none w-full p-4',
                'border-0 rounded-md',
                'focus:ring-2 focus:ring-blue-500 focus:outline-none'
              )}
              style={{ height: minHeight, minHeight }}
            />
            {viewMode === 'split' && (
              <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded z-10">
                編集
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="relative border rounded-md bg-white">
            <div
              className="p-4 overflow-auto"
              style={{ height: minHeight, minHeight }}
            >
              {viewMode === 'split' && (
                <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded z-10">
                  プレビュー
                </div>
              )}
              {value ? (
                <MarkdownViewer content={value} className="prose-sm" />
              ) : (
                <p className="text-gray-400">プレビューする内容がありません</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>マークダウン記法: **太字** *斜体* # 見出し - リスト [リンク](URL)</p>
        <p>ショートカット: Ctrl+B (太字) | Ctrl+I (斜体) | Enter (リスト継続)</p>
      </div>
    </div>
  )
}