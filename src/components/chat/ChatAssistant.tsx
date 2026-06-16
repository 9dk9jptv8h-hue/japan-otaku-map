import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle,
  X,
  Send,
  AlertTriangle,
  Bot,
  User,
  Key,
  Trash2,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  chat,
  getStoredApiKey,
  setStoredApiKey,
  removeStoredApiKey,
  SYSTEM_PROMPT,
} from '@/services/aiService'
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

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****'
  return `${key.slice(0, 3)}****...${key.slice(-4)}`
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

@keyframes chat-panel-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

@keyframes chat-panel-out {
  from { transform: scale(1);   opacity: 1; }
  to   { transform: scale(0.95); opacity: 0; }
}
`

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatAssistant() {
  /* ---- state ---- */
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  /* ---- refs ---- */
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* ---- effects ---- */

  // Load API key on mount
  useEffect(() => {
    const stored = getStoredApiKey()
    if (stored) setApiKey(stored)
  }, [])

  // Auto-scroll on new messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isVisible && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 320)
    }
  }, [isVisible, showSettings])

  // Clear error after 4 seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  /* ---- panel open / close with animation ---- */

  const openPanel = useCallback(() => {
    setIsOpen(true)
    // Two rAF frames so the DOM paints at scale(0.95) first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true))
    })
  }, [])

  const closePanel = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setIsOpen(false)
      setShowSettings(false)
    }, 300)
  }, [])

  const togglePanel = useCallback(() => {
    if (isOpen) closePanel()
    else openPanel()
  }, [isOpen, openPanel, closePanel])

  /* ---- chat logic ---- */

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    // 1. API key check
    if (!apiKey) {
      setShowSettings(true)
      setError('请先设置 API Key')
      return
    }

    // 2. Prompt shield
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

    // 3. Add user message
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
      // 4. Build history (limit to last MAX_HISTORY messages)
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

      // 5. Call AI
      const response = await chat(chatMessages, { apiKey })

      // 6. Add assistant message
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
  }, [input, isLoading, apiKey, messages])

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

  /* ---- settings handlers ---- */

  const handleSaveKey = useCallback(() => {
    const trimmed = apiKeyDraft.trim()
    if (!trimmed) return
    setStoredApiKey(trimmed)
    setApiKey(trimmed)
    setApiKeyDraft('')
    setShowSettings(false)
    setError(null)
  }, [apiKeyDraft])

  const handleClearKey = useCallback(() => {
    removeStoredApiKey()
    setApiKey('')
    setApiKeyDraft('')
  }, [])

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
                'px-3.5 py-2.5 text-sm leading-relaxed',
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
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="AI 聊天助手"
          onKeyDown={handleKeyDown}
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden',
            // Mobile: full-screen
            'inset-0 w-full h-full rounded-none',
            // Desktop: floating panel
            'md:inset-auto md:bottom-20 md:right-5 md:w-[400px] md:h-[500px] md:rounded-[var(--radius-2xl)]',
          )}
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
            animation: isVisible
              ? 'chat-panel-in 300ms var(--ease-out-expo) forwards'
              : 'chat-panel-out 280ms var(--ease-out-expo) forwards',
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
            <button
              aria-label="设置 API Key"
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              onClick={() => setShowSettings((v) => !v)}
            >
              <Key size={18} color="#fff" />
            </button>
            <button
              aria-label="关闭聊天面板"
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              onClick={closePanel}
            >
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* ---- Settings Overlay ---- */}
          {showSettings && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
              style={{
                top: 56,
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="w-full max-w-xs flex flex-col gap-4">
                <h3
                  className="text-base font-semibold text-center"
                  style={{ color: 'var(--color-text)' }}
                >
                  设置 DeepSeek API Key
                </h3>

                {apiKey ? (
                  <div className="flex flex-col gap-3">
                    <div
                      className="text-sm text-center px-3 py-2 rounded-lg"
                      style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-dim)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {maskApiKey(apiKey)}
                    </div>
                    <button
                      onClick={handleClearKey}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        color: '#dc2626',
                      }}
                      aria-label="清除 API Key"
                    >
                      <Trash2 size={14} />
                      清除 Key
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={apiKeyDraft}
                      onChange={(e) => setApiKeyDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveKey()
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-shadow"
                      style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                      aria-label="输入 API Key"
                    />
                    <button
                      onClick={handleSaveKey}
                      disabled={!apiKeyDraft.trim()}
                      className="px-4 py-2.5 rounded-full text-sm font-medium text-white transition-opacity disabled:opacity-40"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      保存
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs underline self-center"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  返回对话
                </button>
              </div>
            </div>
          )}

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
      )}

      {/* ---------- Floating Button ---------- */}
      <button
        aria-label={isOpen ? '关闭聊天助手' : '打开聊天助手'}
        onClick={togglePanel}
        className={cn(
          'fixed z-50 flex items-center justify-center rounded-full transition-all duration-200',
          // Mobile
          'bottom-4 right-4 w-[52px] h-[52px]',
          // Desktop
          'md:bottom-5 md:right-5 md:w-[56px] md:h-[56px]',
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
