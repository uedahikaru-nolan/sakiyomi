'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  Edit,
  Minus,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className,
  rows = 10,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [renderedMarkdown, setRenderedMarkdown] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Simple markdown to HTML converter
  const renderMarkdown = useCallback((text: string) => {
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\+ (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Checkboxes
      .replace(/^\[ \] (.*$)/gim, '<li class="ml-4 list-none">☐ $1</li>')
      .replace(/^\[x\] (.*$)/gim, '<li class="ml-4 list-none">☑ $1</li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br />')

    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ul class="my-2">${match.replace(/<br \/>/g, '')}</ul>`
    })
    html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ol class="my-2">${match.replace(/<br \/>/g, '')}</ol>`
    })

    return html
  }, [])

  useEffect(() => {
    if (isPreview) {
      setRenderedMarkdown(renderMarkdown(value))
    }
  }, [value, isPreview, renderMarkdown])

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
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border rounded-md bg-gray-50">
        <div className="flex items-center gap-1 mr-2">
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

        <div className="flex items-center gap-1 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('**', '**', 'テキスト')}
            title="太字"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('*', '*', 'テキスト')}
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-2">
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

        <div className="flex items-center gap-1 mr-2">
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

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? '編集' : 'プレビュー'}
        >
          {isPreview ? (
            <>
              <Edit className="w-4 h-4 mr-1" />
              編集
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1" />
              プレビュー
            </>
          )}
        </Button>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <div
          className="min-h-[200px] p-4 border rounded-md bg-white prose prose-sm max-w-none"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: renderedMarkdown || '<p class="text-gray-400">プレビューする内容がありません</p>' }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm resize-y"
        />
      )}

      {/* Markdown hints */}
      {!isPreview && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>マークダウン記法: **太字** *斜体* # 見出し - リスト 1. 番号リスト [ ] チェックボックス</p>
          <p>ショートカット: Enterキーでリストの自動継続</p>
        </div>
      )}
    </div>
  )
}