import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  AlertTriangle,
  Bot,
  User,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { chat, SYSTEM_PROMPT } from '@/services/aiService'
import { scanInput, getSafetyMessage } from '@/services/promptShield'
import type { ChatMessage } from '@/services/aiService'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  blocked?: boolean
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WELCOME_MESSAGE: DisplayMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！我是日本动漫店铺地图的AI小助手 🗾 有什么关于日本动漫店铺的问题想问我吗？',
  timestamp: new Date(),
}

const MAX_HISTORY = 20

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/* ------------------------------------------------------------------ */
/*  Inline keyframes (cannot be expressed with Tailwind alone)         */
/* ------------------------------------------------------------------ */

const KEYFRAMES = `
@keyframes chat-pop-in {
  0%   { transform: scale(0.4); opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
}

@keyframes chat-bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-6px); }
}
`

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatAssistant() {
  /* ---- state ---- */
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ---- refs ---- */
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* ---- effects ---- */

  // Auto-scroll on new messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Clear error after 4 seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  /* ---- panel open / close ---- */

  const closePanel = useCallback(() => setIsOpen(false), [])

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  /* ---- chat logic ---- */

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    // 1. Prompt shield
    const scanResult = scanInput(text)
    if (!scanResult.allowed) {
      const safetyMsg = getSafetyMessage(scanResult)
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'user',
          content: text,
          timestamp: new Date(),
          blocked: true,
        },
        {
          id: generateId(),
          role: 'system',
          content: safetyMsg,
          timestamp: new Date(),
          blocked: true,
        },
      ])
      setInput('')
      return
    }

    // 2. Add user message
    const userMsg: DisplayMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // 3. Build history (limit to last MAX_HISTORY messages)
      const recentMessages = [...messages, userMsg]
        .filter((m) => !m.blocked && m.role !== 'system')
        .slice(-MAX_HISTORY)

      const chatMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ]

      // 4. Call AI (no API key needed — Worker handles it)
      const response = await chat(chatMessages)

      // 5. Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '请求失败，请稍后再试'
      setError(message)
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, isLoading, messages])

  /* ---- key handling ---- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
      if (e.key === 'Escape') {
        closePanel()
      }
    },
    [handleSend, closePanel],
  )

  /* ---- render helpers ---- */

  const renderMessage = (msg: DisplayMessage) => {
    const isUser = msg.role === 'user'
    const isBlocked = msg.blocked

    if (isBlocked && msg.role === 'system') {
      return (
        <div key={msg.id} className="flex justify-center my-2 px-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs max-w-[90%]"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#b91c1c',
            }}
          >
            <AlertTriangle size={14} className="shrink-0" />
            <span>{msg.content}</span>
          </div>
        </div>
      )
    }

    return (
      <div
        key={msg.id}
        className={cn(
          'flex mb-3',
          isUser ? 'justify-end' : 'justify-start',
        )}
      >
        <div
          className={cn('flex gap-2 max-w-[85%]', isUser && 'flex-row-reverse')}
        >
          {/* Avatar */}
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
            style={{
              background: isUser
                ? 'var(--color-accent)'
                : 'rgba(0,0,0,0.06)',
            }}
          >
            {isUser ? (
              <User size={14} color="#fff" />
            ) : (
              <Bot size={14} style={{ color: 'var(--color-text-dim)' }} />
            )}
          </div>

          {/* Bubble */}
          <div>
            <div
              className={cn(
                'px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                isUser
                  ? 'rounded-2xl rounded-br-md'
                  : 'rounded-2xl rounded-bl-md',
                isBlocked && isUser && 'opacity-60',
              )}
              style={
                isUser
                  ? {
                      background: isBlocked
                        ? 'rgba(239,68,68,0.12)'
                        : 'var(--color-accent)',
                      color: isBlocked ? '#b91c1c' : '#ffffff',
                      border: isBlocked
                        ? '1px solid rgba(239,68,68,0.3)'
                        : 'none',
                    }
                  : {
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {isBlocked && isUser && (
                <AlertTriangle
                  size={13}
                  className="inline mr-1.5 -mt-0.5"
                  style={{ color: '#b91c1c' }}
                />
              )}
              {msg.content}
            </div>
            <div
              className={cn(
                'text-xs mt-1 px-1',
                isUser ? 'text-right' : 'text-left',
              )}
              style={{ color: 'var(--color-text-dim)' }}
            >
              {msg.timestamp.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <>
      {/* Injected keyframes */}
      <style>{KEYFRAMES}</style>

      {/* ---------- Chat Panel ---------- */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="AI 聊天助手"
        aria-hidden={!isOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden',
          // 过渡动画
          'transition-all duration-[250ms] ease-out origin-bottom-right',
          // 显隐控制
          isOpen
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-[0.9] pointer-events-none',
          // 移动端全屏
          'inset-0 w-full h-full rounded-none',
          // 桌面端：缩小尺寸 360x440
          'md:inset-auto md:bottom-[100px] md:right-4 md:w-[360px] md:h-[440px] md:rounded-[var(--radius-2xl)]',
        )}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
          {/* ---- Header ---- */}
          <div
            className="shrink-0 flex items-center gap-3 px-4"
            style={{
              height: 56,
              background: 'linear-gradient(135deg, #e91e63, #9c27b0, #2196f3)',
            }}
          >
            <Bot size={24} color="#fff" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">
                AI小助手
              </div>
              <div className="text-white/70 text-xs leading-tight">
                动漫店铺问答
              </div>
            </div>
          </div>

          {/* ---- Messages ---- */}
          <div
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map(renderMessage)}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="flex gap-2 max-w-[85%]">
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(0,0,0,0.06)' }}
                  >
                    <Bot
                      size={14}
                      style={{ color: 'var(--color-text-dim)' }}
                    />
                  </div>
                  <div
                    className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block rounded-full"
                        style={{
                          width: 6,
                          height: 6,
                          background: 'var(--color-text-dim)',
                          animation: 'chat-bounce-dot 1.2s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error toast */}
            {error && (
              <div className="flex justify-center my-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#b91c1c',
                  }}
                >
                  <AlertTriangle size={13} className="shrink-0" />
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input Area ---- */}
          <div
            className="shrink-0 flex items-center gap-2 px-4 py-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSend()
                }
              }}
              placeholder="输入你的问题..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-shadow"
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: 'none',
              }}
              aria-label="消息输入框"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="发送消息"
              className="shrink-0 flex items-center justify-center rounded-full transition-opacity disabled:opacity-35"
              style={{
                width: 40,
                height: 40,
                background: 'var(--color-accent)',
              }}
            >
              <Send size={18} color="#fff" />
            </button>
          </div>
        </div>

      {/* ---------- Floating Button ---------- */}
      <button
        aria-label={isOpen ? '关闭聊天助手' : '打开聊天助手'}
        onClick={togglePanel}
        className={cn(
          'fixed z-50 flex items-center justify-center rounded-full transition-all duration-200',
          'bottom-10 right-3 w-[52px] h-[52px]',
          'md:bottom-9 md:right-4 md:w-[56px] md:h-[56px]',
        )}
        style={{
          background: 'var(--color-accent)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          animation: 'chat-pop-in 400ms var(--ease-spring) both',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            'var(--shadow-lg), var(--shadow-glow-accent)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            'var(--shadow-lg)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        }}
      >
        <MessageCircle
          size={24}
          className="transition-all duration-200"
          style={{
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'rotate(90deg) scale(0)' : 'rotate(0) scale(1)',
            position: isOpen ? 'absolute' : 'static',
          }}
        />
        <X
          size={24}
          className="transition-all duration-200"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0)',
            position: isOpen ? 'static' : 'absolute',
          }}
        />
      </button>
    </>
  )
}
