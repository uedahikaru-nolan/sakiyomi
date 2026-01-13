'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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

interface RichMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichMarkdownEditor({
  value,
  onChange,
  placeholder = '',
  className,
  minHeight = '200px',
}: RichMarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 })

  // Convert markdown to styled HTML for live preview in editor
  const renderStyledContent = useCallback((text: string) => {
    if (!text) return `<span class="text-gray-400">${placeholder}</span>`

    // Escape HTML but preserve our markers
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Apply styles for markdown syntax
    // Headers
    html = html.replace(/^### (.*)$/gm, '<div class="text-lg font-semibold text-gray-900">### $1</div>')
    html = html.replace(/^## (.*)$/gm, '<div class="text-xl font-semibold text-gray-900">## $1</div>')
    html = html.replace(/^# (.*)$/gm, '<div class="text-2xl font-bold text-gray-900"># $1</div>')

    // Bold (must come before italic to handle **text** correctly)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold text-gray-900">**$1**</span>')

    // Italic
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<span class="italic text-gray-700">*$1*</span>')

    // Lists
    html = html.replace(/^(\s*)[\*\-\+] (.*)$/gm, '<div class="ml-4">$1• $2</div>')
    html = html.replace(/^(\s*)(\d+)\. (.*)$/gm, '<div class="ml-4">$1$2. $3</div>')

    // Checkboxes
    html = html.replace(/^\[ \] (.*)$/gm, '<div class="ml-4">☐ $1</div>')
    html = html.replace(/^\[x\] (.*)$/gm, '<div class="ml-4">✅ $1</div>')

    // Blockquotes
    html = html.replace(/^&gt; (.*)$/gm, '<div class="border-l-4 border-gray-300 pl-4 text-gray-600 italic">&gt; $1</div>')

    // Code
    html = html.replace(/`([^`]+)`/g, '<span class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm text-pink-600">`$1`</span>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-blue-600 underline">[$1]($2)</span>')

    // Horizontal rule
    html = html.replace(/^---$/gm, '<div class="border-b border-gray-300 my-2">---</div>')

    // Convert newlines to divs
    const lines = html.split('\n')
    html = lines.map(line => line || '<div><br/></div>').join('')

    return html
  }, [placeholder])

  // Render markdown for preview mode
  const renderMarkdownPreview = useCallback((text: string) => {
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
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\+ (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      // Checkboxes
      .replace(/^\[ \] (.*$)/gim, '<li class="ml-6 list-none flex items-start"><span class="mr-2">☐</span><span>$1</span></li>')
      .replace(/^\[x\] (.*$)/gim, '<li class="ml-6 list-none flex items-start"><span class="mr-2">✅</span><span>$1</span></li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">$1</blockquote>')
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre class="bg-gray-100 p-3 rounded my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br />')

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ul class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ul>`
    })
    html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ol class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ol>`
    })
    html = html.replace(/(<li class="ml-6 list-none flex items-start">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ul class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ul>`
    })

    return html
  }, [])

  // Handle input in contentEditable
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || ''
      onChange(text)
    }
  }, [onChange])

  // Update content when value changes externally
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      const currentText = editorRef.current.innerText || ''
      if (currentText !== value) {
        editorRef.current.innerHTML = renderStyledContent(value)
      }
    }
  }, [value, isFocused, renderStyledContent])

  // Insert markdown at cursor
  const insertMarkdown = useCallback((before: string, after: string = '', defaultText: string = '') => {
    if (!editorRef.current) return

    const sel = window.getSelection()
    if (!sel) return

    const range = sel.getRangeAt(0)
    const selectedText = range.toString() || defaultText

    // Delete current selection
    range.deleteContents()

    // Insert new text
    const textNode = document.createTextNode(before + selectedText + after)
    range.insertNode(textNode)

    // Move cursor after inserted text
    range.setStartAfter(textNode)
    range.setEndAfter(textNode)
    sel.removeAllRanges()
    sel.addRange(range)

    handleInput()
    editorRef.current.focus()
  }, [handleInput])

  // Insert at line start
  const insertAtLineStart = useCallback((prefix: string) => {
    if (!editorRef.current) return

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const currentNode = range.startContainer
    const text = currentNode.textContent || ''
    const offset = range.startOffset

    // Find line start
    const beforeCursor = text.substring(0, offset)
    const lastNewline = beforeCursor.lastIndexOf('\n')
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1

    // Insert prefix at line start
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart)

    if (currentNode.nodeType === Node.TEXT_NODE && currentNode.parentNode) {
      currentNode.textContent = newText

      // Update cursor position
      range.setStart(currentNode, lineStart + prefix.length)
      range.setEnd(currentNode, lineStart + prefix.length)
      sel.removeAllRanges()
      sel.addRange(range)
    }

    handleInput()
    editorRef.current.focus()
  }, [handleInput])

  // Handle key events for auto-completion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      const range = sel.getRangeAt(0)
      const currentNode = range.startContainer
      const text = currentNode.textContent || ''
      const offset = range.startOffset

      // Get current line
      const lines = text.substring(0, offset).split('\n')
      const currentLine = lines[lines.length - 1]

      // Check for list continuation
      let newLinePrefix = '\n'

      if (currentLine.match(/^[\*\-\+]\s/)) {
        newLinePrefix = '\n' + currentLine[0] + ' '
      } else if (currentLine.match(/^(\d+)\.\s/)) {
        const match = currentLine.match(/^(\d+)\./)
        if (match) {
          const nextNum = parseInt(match[1]) + 1
          newLinePrefix = '\n' + nextNum + '. '
        }
      } else if (currentLine.match(/^\[[ x]\]\s/)) {
        newLinePrefix = '\n[ ] '
      }

      // Insert new line with prefix
      const textNode = document.createTextNode(newLinePrefix)
      range.deleteContents()
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      sel.removeAllRanges()
      sel.addRange(range)

      handleInput()
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
          className="p-4 border rounded-md bg-white prose prose-sm max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdownPreview(value) || '<p class="text-gray-400">プレビューする内容がありません</p>'
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            'p-4 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
            'text-base leading-relaxed whitespace-pre-wrap',
            'overflow-auto'
          )}
          style={{ minHeight }}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: renderStyledContent(value) }}
        />
      )}

      {/* Markdown hints */}
      {!isPreview && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>マークダウン記法がリアルタイムで反映されます: **太字** *斜体* # 見出し - リスト</p>
          <p>ショートカット: Enterキーでリストの自動継続</p>
        </div>
      )}
    </div>
  )
}