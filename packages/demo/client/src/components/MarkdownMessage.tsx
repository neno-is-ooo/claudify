import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useTheme } from '../hooks/useTheme'

interface MarkdownMessageProps {
    content: string
    isUser: boolean
}

export default function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
    const { theme, variant } = useTheme()

    return (
        <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: isUser ? theme.primary.background : theme.primary.foreground
        }}>
            <ReactMarkdown
                components={{
                    // Style code blocks
                    code: ({ children, className }) => {
                        const isInline = !className
                        if (isInline) {
                            return (
                                <code style={{
                                    backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : (variant === 'dark' ? '#1a1a1a' : '#f5f5f5'),
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                                }}>
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <pre style={{
                                backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : (variant === 'dark' ? '#1a1a1a' : '#f5f5f5'),
                                padding: '12px',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '13px',
                                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                margin: '8px 0'
                            }}>
                                <code>{children}</code>
                            </pre>
                        )
                    },
                    // Style bold text
                    strong: ({ children }) => (
                        <strong style={{ fontWeight: '600' }}>{children}</strong>
                    ),
                    // Style italic text
                    em: ({ children }) => (
                        <em style={{ fontStyle: 'italic' }}>{children}</em>
                    ),
                    // Style lists
                    ul: ({ children }) => (
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ol>
                    ),
                    // Style list items
                    li: ({ children }) => (
                        <li style={{ margin: '2px 0' }}>{children}</li>
                    ),
                    // Style headings
                    h1: ({ children }) => (
                        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: '12px 0 8px 0' }}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '10px 0 6px 0' }}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '8px 0 4px 0' }}>{children}</h3>
                    ),
                    // Style paragraphs
                    p: ({ children }) => (
                        <p style={{ margin: '8px 0', lineHeight: '1.6' }}>{children}</p>
                    ),
                    // Style blockquotes
                    blockquote: ({ children }) => (
                        <blockquote style={{
                            borderLeft: `3px solid ${isUser ? 'rgba(255,255,255,0.3)' : theme.primary.foreground}`,
                            paddingLeft: '12px',
                            margin: '8px 0',
                            fontStyle: 'italic',
                            opacity: 0.8
                        }}>
                            {children}
                        </blockquote>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}