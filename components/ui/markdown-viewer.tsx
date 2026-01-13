'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const renderedHTML = useMemo(() => {
    if (!content) return ''

    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold and Italic (order matters - bold first)
      .replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\+ (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      // Checkboxes
      .replace(/^\[ \] (.*$)/gim, '<li class="ml-6 list-none flex items-start"><span class="mr-2">☐</span><span>$1</span></li>')
      .replace(/^\[x\] (.*$)/gim, '<li class="ml-6 list-none flex items-start"><span class="mr-2">✅</span><span>$1</span></li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-700">$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-4 border-gray-300" />')
      // Code blocks
      .replace(/```([^`]+)```/gim, '<pre class="bg-gray-100 p-3 rounded my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br />')

    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ul class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ul>`
    })
    html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ol class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ol>`
    })
    html = html.replace(/(<li class="ml-6 list-none flex items-start">.*<\/li>(\s*<br \/>)*)+/gim, (match) => {
      return `<ul class="my-3 space-y-1">${match.replace(/<br \/>/g, '')}</ul>`
    })

    // Clean up excessive line breaks
    html = html.replace(/(<br \/>){3,}/gim, '<br /><br />')

    return html
  }, [content])

  if (!content) {
    return <p className="text-gray-400">内容がありません</p>
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:text-gray-900',
        'prose-p:text-gray-700',
        'prose-strong:text-gray-900',
        'prose-code:text-pink-600',
        'prose-pre:bg-gray-100',
        'prose-blockquote:text-gray-600 prose-blockquote:border-gray-300',
        'prose-ul:text-gray-700 prose-ol:text-gray-700',
        'prose-a:text-blue-600',
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  )
}