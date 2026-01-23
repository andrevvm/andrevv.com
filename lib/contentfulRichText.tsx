import React from 'react'

// Types for Contentful Rich Text structure
interface RichTextMark {
  type: 'bold' | 'italic' | 'underline' | 'code'
}

interface RichTextNode {
  nodeType: string
  value?: string
  marks?: RichTextMark[]
  content?: RichTextNode[]
  data?: {
    uri?: string
    target?: {
      sys?: {
        id?: string
      }
    }
  }
}

interface RichTextDocument {
  content?: RichTextNode[]
}

/**
 * Renders Contentful rich text as React elements with proper formatting
 * Supports: bold, italic, underline, code, links, and paragraph structure
 * @param richText - The Contentful rich text JSON object
 * @returns React elements
 */
export function renderContentfulRichText(
  richText: RichTextDocument | null | undefined,
): React.ReactElement[] {
  if (!richText?.content || !Array.isArray(richText.content)) {
    return []
  }

  return richText.content.map((node, index) => renderNode(node, index))
}

function renderNode(
  node: RichTextNode,
  key: number | string,
): React.ReactElement {
  const { nodeType, content, marks, value, data } = node

  // Handle text nodes
  if (nodeType === 'text' && value !== undefined) {
    let textElement: React.ReactElement = <>{value}</>

    // Apply marks (bold, italic, underline, code)
    if (marks && Array.isArray(marks) && marks.length > 0) {
      marks.forEach((mark, markIndex) => {
        const markKey = `${key}-mark-${markIndex}-${mark.type}`
        switch (mark.type) {
          case 'bold':
            textElement = <strong key={markKey}>{textElement}</strong>
            break
          case 'italic':
            textElement = <em key={markKey}>{textElement}</em>
            break
          case 'underline':
            textElement = (
              <span key={markKey} className="underline">
                {textElement}
              </span>
            )
            break
          case 'code':
            textElement = (
              <code key={markKey} className="font-mono text-sm">
                {textElement}
              </code>
            )
            break
        }
      })
      // After applying marks, the outermost element has a key
      return textElement
    }

    // If no marks, wrap in a fragment with key
    return <React.Fragment key={key}>{value}</React.Fragment>
  }

  // Handle hyperlink nodes
  if (nodeType === 'hyperlink' && content && data?.uri) {
    return (
      <a
        key={key}
        href={data.uri}
        target={data.uri.startsWith('http') ? '_blank' : undefined}
        rel={data.uri.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="underline hover:no-underline"
      >
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-link-${childIndex}`),
        )}
      </a>
    )
  }

  // Handle paragraph nodes
  if (nodeType === 'paragraph' && content) {
    return (
      <p key={key} className="leading-[1.2] normal-case">
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-p-${childIndex}`),
        )}
      </p>
    )
  }

  // Handle heading nodes
  if (
    (nodeType === 'heading-1' ||
      nodeType === 'heading-2' ||
      nodeType === 'heading-3' ||
      nodeType === 'heading-4' ||
      nodeType === 'heading-5' ||
      nodeType === 'heading-6') &&
    content
  ) {
    const HeadingTag = nodeType.replace('heading-', 'h') as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6'
    return (
      <HeadingTag key={key} className="leading-[1.2] normal-case">
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-${nodeType}-${childIndex}`),
        )}
      </HeadingTag>
    )
  }

  // Handle unordered list
  if (nodeType === 'unordered-list' && content) {
    return (
      <ul key={key} className="list-disc list-inside">
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-ul-${childIndex}`),
        )}
      </ul>
    )
  }

  // Handle ordered list
  if (nodeType === 'ordered-list' && content) {
    return (
      <ol key={key} className="list-decimal list-inside">
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-ol-${childIndex}`),
        )}
      </ol>
    )
  }

  // Handle list item
  if (nodeType === 'list-item' && content) {
    return (
      <li key={key}>
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-li-${childIndex}`),
        )}
      </li>
    )
  }

  // Handle blockquote
  if (nodeType === 'blockquote' && content) {
    return (
      <blockquote key={key} className="border-l-4 pl-4 italic">
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-bq-${childIndex}`),
        )}
      </blockquote>
    )
  }

  // Handle HR
  if (nodeType === 'hr') {
    return <hr key={key} />
  }

  // Fallback: render content if available
  if (content && Array.isArray(content)) {
    return (
      <React.Fragment key={key}>
        {content.map((childNode, childIndex) =>
          renderNode(childNode, `${key}-fallback-${childIndex}`),
        )}
      </React.Fragment>
    )
  }

  // Fallback: return empty fragment
  return <React.Fragment key={key} />
}
