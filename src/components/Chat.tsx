'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Add to your project: npm install react-markdown remark-gfm

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
  timestamp?: Date
}

// ── Markdown renderer ────────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className='mb-2 last:mb-0 leading-relaxed'>{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className='text-lg font-bold mb-2 mt-3 first:mt-0'>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className='text-base font-bold mb-2 mt-3 first:mt-0'>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className='text-sm font-bold mb-1 mt-2 first:mt-0'>{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className='list-disc list-inside mb-2 space-y-0.5 pl-1'>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className='list-decimal list-inside mb-2 space-y-0.5 pl-1'>
            {children}
          </ol>
        ),
        li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
        code: ({
          inline,
          children,
          ...props
        }: {
          inline?: boolean
          children?: React.ReactNode
        }) =>
          inline ? (
            <code
              className='px-1.5 py-0.5 rounded text-xs font-mono'
              style={{ background: 'rgba(120,110,95,0.12)', color: '#5c4d3a' }}
              {...props}
            >
              {children}
            </code>
          ) : (
            <code
              className='block rounded-lg p-3 text-xs font-mono leading-relaxed overflow-x-auto mb-2'
              style={{ background: '#f0ebe2', color: '#3d3228' }}
              {...props}
            >
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className='mb-2 last:mb-0'>{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote
            className='border-l-4 pl-3 italic my-2 text-sm'
            style={{ borderColor: '#c4aa8a', color: '#7a6655' }}
          >
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-2 hover:opacity-70 transition-opacity'
            style={{ color: '#7a6655' }}
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className='font-semibold'>{children}</strong>
        ),
        hr: () => (
          <hr
            className='my-3 border-0 border-t'
            style={{ borderColor: '#d9d0c4' }}
          />
        ),
        table: ({ children }) => (
          <div className='overflow-x-auto mb-2'>
            <table className='min-w-full text-xs border-collapse'>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className='px-3 py-1.5 text-left font-semibold border-b'
            style={{ borderColor: '#d9d0c4', color: '#3d3228' }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className='px-3 py-1.5 border-b'
            style={{ borderColor: '#ede7dd', color: '#5c4d3a' }}
          >
            {children}
          </td>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ── Typing cursor ────────────────────────────────────────────────────────────
function TypingCursor() {
  return (
    <span
      className='inline-block w-[2px] h-[1em] align-middle ml-0.5 animate-pulse rounded-sm'
      style={{ background: '#c4aa8a' }}
      aria-hidden='true'
    />
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  const hints = [
    { icon: '💡', text: 'Ask anything — code, writing, analysis' },
    { icon: '⇧↵', text: 'Shift + Enter for a new line' },
    { icon: '⌃Z', text: 'Ctrl + Z to undo last message' }
  ]
  return (
    <div className='flex flex-col items-center justify-center h-full py-20 select-none'>
      <div
        className='w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md'
        style={{
          background: 'linear-gradient(135deg, #e8ddd0 0%, #d4c4b0 100%)'
        }}
      >
        ✦
      </div>
      <h2
        className='text-2xl mb-2 text-center'
        style={{ fontFamily: "'Playfair Display', serif", color: '#3d3228' }}
      >
        How can I help you?
      </h2>
      <p className='text-sm mb-8 text-center' style={{ color: '#9e8e7e' }}>
        Start a conversation below
      </p>
      <div className='flex flex-col gap-2'>
        {hints.map(h => (
          <div
            key={h.text}
            className='flex items-center gap-2.5 text-xs px-4 py-2 rounded-full'
            style={{ background: '#ede7dd', color: '#7a6655' }}
          >
            <span>{h.icon}</span>
            <span>{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [announcement, setAnnouncement] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageIdCounter = useRef(0)

  const generateMessageId = () => `message-${++messageIdCounter.current}`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const announceToScreenReader = (msg: string) => {
    setAnnouncement(msg)
    setTimeout(() => setAnnouncement(''), 1000)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentMessage])
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      id: generateMessageId(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setIsLoading(true)
    setCurrentMessage('')
    announceToScreenReader('Message sent. Waiting for response.')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stream: true
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body')

      let assistantContent = ''
      const assistantId = generateMessageId()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.message?.content) {
                assistantContent += parsed.message.content
                setCurrentMessage(assistantContent)
              }
            } catch {}
          }
        }
      }

      if (assistantContent) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: assistantContent,
            id: assistantId,
            timestamp: new Date()
          }
        ])
        announceToScreenReader('Response received')
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Something went wrong. Please make sure Ollama is running locally.',
          id: generateMessageId(),
          timestamp: new Date()
        }
      ])
      announceToScreenReader('Error occurred')
    } finally {
      setCurrentMessage('')
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    if (e.key === 'Escape') {
      setInput('')
      if (inputRef.current) inputRef.current.style.height = 'auto'
    }
    if (e.ctrlKey && e.key === 'z' && !isLoading) {
      e.preventDefault()
      if (messages.length > 0) {
        setMessages(prev => prev.slice(0, -1))
        announceToScreenReader('Last message removed')
      }
    }
  }

  const formatTimestamp = (date?: Date) =>
    date
      ? date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : ''

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f5f0e8;
        }

        /* Subtle topographic background pattern */
        .topo-bg {
          background-color: #f5f0e8;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(196,170,138,0.18) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(164,140,110,0.13) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(232,221,208,0.25) 0%, transparent 60%);
        }

        /* Scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #d4c4b0; border-radius: 99px; }

        /* Message bubble fade-in */
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-animate { animation: msgIn 0.28s ease-out both; }

        /* Send button pulse on hover */
        .send-btn:not(:disabled):hover {
          box-shadow: 0 0 0 3px rgba(164,130,95,0.22);
        }
        .send-btn:not(:disabled):active {
          transform: scale(0.96);
        }
        .send-btn { transition: box-shadow 0.18s, transform 0.12s, background 0.18s; }

        textarea { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div
        className='flex flex-col h-screen topo-bg'
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Skip link */}
        <a
          href='#chat-messages'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm'
          style={{ background: '#4a3c2e', color: '#f5f0e8' }}
        >
          Skip to messages
        </a>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header
          className='flex-shrink-0 px-6 py-4 flex items-center justify-between border-b'
          style={{
            background: 'rgba(245,240,232,0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: '#dfd6c8'
          }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm flex-shrink-0'
              style={{
                background: 'linear-gradient(135deg, #c4aa8a, #a48060)'
              }}
            >
              ✦
            </div>
            <div>
              <h1
                className='text-lg leading-tight'
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#3d3228'
                }}
              >
                Ollama Chat
              </h1>
              <p className='text-xs' style={{ color: '#a08070' }}>
                Local AI · Private by default
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div
            className='flex items-center gap-1.5 text-xs px-3 py-1 rounded-full'
            style={{ background: '#ede7dd', color: '#7a6655' }}
          >
            <span
              className='w-1.5 h-1.5 rounded-full'
              style={{ background: isLoading ? '#c4aa8a' : '#7fb97f' }}
            />
            {isLoading ? 'Thinking…' : 'Ready'}
          </div>
        </header>

        {/* Screen reader announcements */}
        <div aria-live='polite' aria-atomic='true' className='sr-only'>
          {announcement}
        </div>

        {/* ── Messages ───────────────────────────────────────────────────────── */}
        <main
          id='chat-messages'
          className='flex-1 overflow-y-auto chat-scroll px-4 py-6'
          role='main'
          aria-label='Chat messages'
        >
          <div className='max-w-3xl mx-auto w-full'>
            {messages.length === 0 && !currentMessage && <EmptyState />}

            <ol className='space-y-6' aria-label='Conversation history'>
              {messages.map((message, index) => {
                const isUser = message.role === 'user'
                return (
                  <li
                    key={message.id || index}
                    className={`flex gap-3 msg-animate ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    role='article'
                    aria-label={`${isUser ? 'You' : 'Assistant'}, message ${index + 1}`}
                  >
                    {/* Avatar */}
                    <div className='flex-shrink-0 mt-0.5'>
                      <div
                        className='w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm'
                        style={
                          isUser
                            ? { background: '#4a3c2e', color: '#f5f0e8' }
                            : {
                                background:
                                  'linear-gradient(135deg, #c4aa8a, #a48060)',
                                color: '#fff'
                              }
                        }
                        aria-hidden='true'
                      >
                        {isUser ? '👤' : '✦'}
                      </div>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className='px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed'
                        style={
                          isUser
                            ? {
                                background: '#4a3c2e',
                                color: '#f5f0e8',
                                borderBottomRightRadius: '4px'
                              }
                            : {
                                background: '#fdfaf5',
                                color: '#3d3228',
                                border: '1px solid #e8ddd0',
                                borderBottomLeftRadius: '4px'
                              }
                        }
                        tabIndex={0}
                      >
                        {isUser ? (
                          <p className='whitespace-pre-wrap'>
                            {message.content}
                          </p>
                        ) : (
                          <MarkdownContent content={message.content} />
                        )}
                      </div>
                      <span
                        className='text-[10px] mt-1.5 px-1'
                        style={{ color: '#b0a090' }}
                        aria-hidden='true'
                      >
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>

            {/* Streaming message */}
            {currentMessage && (
              <div className='flex gap-3 mt-6 msg-animate'>
                <div className='flex-shrink-0 mt-0.5'>
                  <div
                    className='w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm'
                    style={{
                      background: 'linear-gradient(135deg, #c4aa8a, #a48060)',
                      color: '#fff'
                    }}
                    aria-hidden='true'
                  >
                    ✦
                  </div>
                </div>
                <div className='flex flex-col items-start max-w-[75%]'>
                  <div
                    className='px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed'
                    style={{
                      background: '#fdfaf5',
                      color: '#3d3228',
                      border: '1px solid #e8ddd0',
                      borderBottomLeftRadius: '4px'
                    }}
                    aria-live='polite'
                    aria-label='Assistant is typing'
                  >
                    <MarkdownContent content={currentMessage} />
                    <TypingCursor />
                  </div>
                  <span
                    className='text-[10px] mt-1.5 px-1'
                    style={{ color: '#b0a090' }}
                  >
                    Typing…
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden='true' />
          </div>
        </main>

        {/* ── Input footer ────────────────────────────────────────────────────── */}
        <footer
          className='flex-shrink-0 px-4 pb-5 pt-3'
          style={{
            background: 'rgba(245,240,232,0.9)',
            backdropFilter: 'blur(12px)'
          }}
          role='contentinfo'
        >
          <div className='max-w-3xl mx-auto'>
            <div
              className='flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md'
              style={{
                background: '#fdfaf5',
                border: '1.5px solid #dfd6c8',
                boxShadow: '0 2px 16px rgba(100,80,60,0.08)'
              }}
            >
              {/* Paperclip / attachment placeholder icon */}
              <button
                type='button'
                className='flex-shrink-0 mb-0.5 opacity-40 hover:opacity-70 transition-opacity'
                style={{ color: '#7a6655' }}
                aria-label='Attach file (not yet available)'
                disabled
              >
                📎
              </button>

              <label htmlFor='chat-input' className='sr-only'>
                Type your message
              </label>
              <textarea
                id='chat-input'
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Message…'
                className='flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:opacity-50'
                style={{
                  color: '#3d3228',
                  minHeight: '24px',
                  maxHeight: '128px'
                }}
                rows={1}
                disabled={isLoading}
                aria-describedby='input-hint'
                autoComplete='off'
              />

              {/* Send button */}
              <button
                type='button'
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className='send-btn flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium mb-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed'
                style={{
                  background:
                    input.trim() && !isLoading ? '#4a3c2e' : '#c4aa8a',
                  color: '#f5f0e8'
                }}
                aria-label={isLoading ? 'Sending…' : 'Send message'}
              >
                {isLoading ? (
                  <svg
                    className='animate-spin w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    aria-hidden='true'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeDasharray='31.4'
                      strokeDashoffset='10'
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='w-4 h-4 translate-x-px -translate-y-px'
                    aria-hidden='true'
                  >
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
                  </svg>
                )}
              </button>
            </div>

            <p
              id='input-hint'
              className='text-[10px] text-center mt-2'
              style={{ color: '#b0a090' }}
            >
              ↵ send &nbsp;·&nbsp; ⇧↵ new line &nbsp;·&nbsp; ⎋ clear
              &nbsp;·&nbsp; ⌃Z undo
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
