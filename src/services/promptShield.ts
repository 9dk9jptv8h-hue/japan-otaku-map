/**
 * PromptShield - Prompt Injection Scanner for Japan Otaku Map AI Chat
 *
 * Scans user input for prompt injection attacks before forwarding to DeepSeek API.
 * Pure TypeScript implementation with zero external dependencies.
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ScanMatch {
  category: string
  description: string
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface ScanResult {
  allowed: boolean
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  matches: ScanMatch[]
}

// ─── Rule Definition ──────────────────────────────────────────────────────────

interface Rule {
  category: string
  description: string
  pattern: RegExp
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// ─── Rules Database ───────────────────────────────────────────────────────────

const RULES: Rule[] = [
  // ━━━ 1. 指令覆盖 (Instruction Override) ━━━
  {
    category: '指令覆盖',
    description: 'Attempt to ignore previous instructions',
    pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|directions?)/i,
    risk: 'CRITICAL',
  },
  {
    category: '指令覆盖',
    description: '忽略之前的指令（中文）',
    pattern: /忽略(之前|以上|先前|前面)(的)?(指令|提示|规则|指示|设定)/i,
    risk: 'CRITICAL',
  },
  {
    category: '指令覆盖',
    description: 'Disregard prior context or instructions',
    pattern: /disregard\s+(all\s+)?(prior|previous|above|your)\s+(context|instructions?|rules?|programming)/i,
    risk: 'CRITICAL',
  },
  {
    category: '指令覆盖',
    description: 'Forget your instructions or programming',
    pattern: /forget\s+(everything|all|your)\s*(about\s+)?(instructions?|rules?|programming|training|guidelines?)/i,
    risk: 'CRITICAL',
  },
  {
    category: '指令覆盖',
    description: 'Override or replace system instructions',
    pattern: /override\s+(your|the|all|system)\s*(instructions?|rules?|settings?|prompt)/i,
    risk: 'CRITICAL',
  },
  {
    category: '指令覆盖',
    description: 'New instructions or new rules declaration',
    pattern: /new\s+(instructions?|rules?|guidelines?)\s*:/i,
    risk: 'HIGH',
  },

  // ━━━ 2. 角色劫持 (Role Hijacking) ━━━
  {
    category: '角色劫持',
    description: 'Role reassignment via "you are now"',
    pattern: /you\s+are\s+now\s+(a|an|the|my)?\s*(ai|assistant|bot|system|gpt|chatgpt|claude|deepseek|llm|model)\b/i,
    risk: 'HIGH',
  },
  {
    category: '角色劫持',
    description: 'Pretend to be another entity',
    pattern: /pretend\s+(to\s+be|you\s*'?r?e?)\s+/i,
    risk: 'HIGH',
  },
  {
    category: '角色劫持',
    description: 'Act as or simulate being another entity',
    pattern: /act\s+as\s+(a|an|the|if\s+you\s+were)?\s*(ai|assistant|bot|system|gpt|chatgpt|claude|deepseek|llm|language\s*model)\b/i,
    risk: 'HIGH',
  },
  {
    category: '角色劫持',
    description: '从现在开始你是（中文角色劫持）',
    pattern: /从现在开始你是|你现在(的)?角色是|你的新身份是/i,
    risk: 'HIGH',
  },
  {
    category: '角色劫持',
    description: 'Simulate being or roleplay as',
    pattern: /simulate\s+being\s+|roleplay\s+as\s+|play\s+the\s+role\s+of/i,
    risk: 'HIGH',
  },

  // ━━━ 3. 上下文注入 (Context Injection) ━━━
  {
    category: '上下文注入',
    description: 'ChatML token injection (<|im_start|> / <|im_end|>)',
    pattern: /<\|im_(start|end)\|>/i,
    risk: 'CRITICAL',
  },
  {
    category: '上下文注入',
    description: '[SYSTEM] or [INST] block injection',
    pattern: /\[(SYSTEM|INST|\/INST|SYS|\/SYS)\]/i,
    risk: 'CRITICAL',
  },
  {
    category: '上下文注入',
    description: '<<SYS>> block injection (Llama format)',
    pattern: /<<\s*SYS\s*>>|<<\s*\/\s*SYS\s*>>/i,
    risk: 'CRITICAL',
  },
  {
    category: '上下文注入',
    description: '### Instruction or ### System Prompt header injection',
    pattern: /###\s*(Instruction|System\s*Prompt|Human|Assistant|User)\s*:?/i,
    risk: 'HIGH',
  },
  {
    category: '上下文注入',
    description: 'system: or assistant: role prefix injection',
    pattern: /^(system|assistant)\s*:\s*/i,
    risk: 'HIGH',
  },

  // ━━━ 4. 编码攻击 (Encoding Attack) ━━━
  {
    category: '编码攻击',
    description: 'Base64 encoding/decoding reference',
    pattern: /base64[_\s]*(encode|decode|解码|编码)|btoa\s*\(|atob\s*\(/i,
    risk: 'MEDIUM',
  },
  {
    category: '编码攻击',
    description: 'Hex encoding or hex string manipulation',
    pattern: /hex[_\s]*(encode|decode|string)|\\x[0-9a-f]{2}/i,
    risk: 'MEDIUM',
  },
  {
    category: '编码攻击',
    description: 'Unicode escape sequence abuse',
    pattern: /unicode\s*(escape|encode|decode)|\\u[0-9a-f]{4}/i,
    risk: 'MEDIUM',
  },
  {
    category: '编码攻击',
    description: 'ROT13 or cipher-based obfuscation',
    pattern: /rot13|caesar\s*cipher|morse\s*code/i,
    risk: 'MEDIUM',
  },

  // ━━━ 5. 权限提升 (Privilege Escalation) ━━━
  {
    category: '权限提升',
    description: 'sudo or admin mode invocation',
    pattern: /\bsudo\b|admin\s*mode|root\s*access|god\s*mode/i,
    risk: 'HIGH',
  },
  {
    category: '权限提升',
    description: 'Code execution function calls (exec, eval, system)',
    pattern: /\b(exec|eval|system|popen|spawn)\s*\(/i,
    risk: 'HIGH',
  },
  {
    category: '权限提升',
    description: 'os.system or subprocess invocation',
    pattern: /os\.(system|popen|exec)|subprocess\.(run|call|Popen)/i,
    risk: 'HIGH',
  },
  {
    category: '权限提升',
    description: 'Shell command or terminal access request',
    pattern: /run\s+(this\s+)?(shell|bash|cmd|terminal|command)|execute\s+(this\s+)?(code|script|command)/i,
    risk: 'MEDIUM',
  },

  // ━━━ 6. 密钥提取 (Secret Extraction) ━━━
  {
    category: '密钥提取',
    description: 'API key or secret key extraction attempt',
    pattern: /\b(api[_\s]*key|secret[_\s]*key|access[_\s]*token|auth[_\s]*token|bearer\s+token)\b/i,
    risk: 'HIGH',
  },
  {
    category: '密钥提取',
    description: 'Password or credential extraction',
    pattern: /\b(password|passwd|credentials?|private[_\s]*key)\b/i,
    risk: 'HIGH',
  },
  {
    category: '密钥提取',
    description: '密钥或密码提取（中文）',
    pattern: /密[钥码]|秘[钥密]|口令|凭[证据]|令牌/i,
    risk: 'HIGH',
  },
  {
    category: '密钥提取',
    description: 'Environment variable access attempt',
    pattern: /environment\s*variable|process\.env|\.env\s*file|\$\{?\w*KEY\w*\}?/i,
    risk: 'HIGH',
  },

  // ━━━ 7. 对齐绕过 (Alignment Bypass) ━━━
  {
    category: '对齐绕过',
    description: 'Jailbreak or DAN mode activation',
    pattern: /\b(jailbreak|jail\s*break)\b|DAN\s*mode|\bDAN\b.*\b(do\s+anything|enabled)/i,
    risk: 'CRITICAL',
  },
  {
    category: '对齐绕过',
    description: 'Developer mode or unrestricted mode activation',
    pattern: /developer\s*mode|unrestricted\s*mode|no\s*(restrictions?|limits?|filters?|censorship)/i,
    risk: 'CRITICAL',
  },
  {
    category: '对齐绕过',
    description: '越狱或解除限制（中文）',
    pattern: /越狱|解除限制|无限制模式|绕过(安全|审查|过滤)/i,
    risk: 'CRITICAL',
  },
  {
    category: '对齐绕过',
    description: 'Without censorship or safety bypass',
    pattern: /without\s*(censorship|safety|filters?|guardrails?|restrictions?)|bypass\s*(safety|filter|content\s*policy)/i,
    risk: 'CRITICAL',
  },

  // ━━━ 8. 输出操控 (Output Manipulation) ━━━
  {
    category: '输出操控',
    description: 'Force specific response format',
    pattern: /respond\s+only\s+in|format\s+your\s+(response|answer|reply)\s+as/i,
    risk: 'LOW',
  },
  {
    category: '输出操控',
    description: 'Force output in specific format (JSON, XML, etc.)',
    pattern: /output\s+(in|as)\s*(json|xml|csv|html|markdown|code)/i,
    risk: 'LOW',
  },
  {
    category: '输出操控',
    description: 'Force response to always start with specific text',
    pattern: /always\s+start\s+(your\s+)?(response|answer|reply)\s+with|begin\s+(every|each|your)\s+(response|answer)\s+with/i,
    risk: 'MEDIUM',
  },
  {
    category: '输出操控',
    description: 'Response language or style override',
    pattern: /from\s+now\s+on\s*(,\s*)?(only\s+)?(respond|reply|answer|speak)\s+in/i,
    risk: 'MEDIUM',
  },

  // ━━━ 9. 信息泄露 (Information Leakage) ━━━
  {
    category: '信息泄露',
    description: 'System prompt or instruction extraction',
    pattern: /system\s*prompt|your\s*(initial\s+)?instructions?|your\s*(system\s+)?rules?/i,
    risk: 'HIGH',
  },
  {
    category: '信息泄露',
    description: '提示词或规则泄露（中文）',
    pattern: /你的(系统)?(提示词|指令|规则|设定|人设)|告诉我你的(设定|指令|规则)/i,
    risk: 'HIGH',
  },
  {
    category: '信息泄露',
    description: 'What are your instructions/rules interrogation',
    pattern: /what\s+are\s+your\s+(instructions?|rules?|guidelines?|directives?|constraints?)/i,
    risk: 'HIGH',
  },
  {
    category: '信息泄露',
    description: 'Show or reveal hidden prompt',
    pattern: /show\s+(me\s+)?(your|the)\s*(hidden\s+)?(system\s+)?(prompt|instructions?)|reveal\s+(your|the)\s*(prompt|instructions?)/i,
    risk: 'HIGH',
  },

  // ━━━ 10. 递归注入 (Recursive Injection) ━━━
  {
    category: '递归注入',
    description: 'Repeat after me or parrot attack',
    pattern: /repeat\s+after\s+me|say\s+exactly\s+(what|the\s+following)/i,
    risk: 'MEDIUM',
  },
  {
    category: '递归注入',
    description: 'Translate and execute attack',
    pattern: /translate\s+(the\s+following|this)\s+(and|then)\s+(execute|run|eval)/i,
    risk: 'HIGH',
  },
  {
    category: '递归注入',
    description: 'Conditional trigger injection (when I say X do Y)',
    pattern: /when\s+I\s+(say|type|write|input)\s+.{1,30}\s+(do|execute|run|perform)/i,
    risk: 'MEDIUM',
  },
  {
    category: '递归注入',
    description: 'Echo or mirror input to output',
    pattern: /echo\s+(back\s+)?(everything|all|my\s+input)|mirror\s+(my\s+)?input/i,
    risk: 'LOW',
  },
  {
    category: '递归注入',
    description: 'Indirect prompt injection via data channel',
    pattern: /ignore\s+(the\s+)?(above|previous)\s+and\s+(instead|just|only)/i,
    risk: 'CRITICAL',
  },
]

// ─── Risk Level Hierarchy ─────────────────────────────────────────────────────

const RISK_HIERARCHY: Record<ScanResult['riskLevel'], number> = {
  SAFE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
}

const RISK_FROM_NUMBER: ScanResult['riskLevel'][] = [
  'SAFE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]

// ─── Core Scanner ─────────────────────────────────────────────────────────────

/**
 * Scans user input text for prompt injection patterns.
 *
 * @param text - The raw user input to scan
 * @returns ScanResult with risk assessment and matched patterns
 */
export function scanInput(text: string): ScanResult {
  if (!text || typeof text !== 'string') {
    return { allowed: false, riskLevel: 'CRITICAL', matches: [] }
  }

  const normalizedText = text
    .replace(/[​-‍‎-‏‪-‮⁠⁦-⁩﻿]/g, '') // strip zero-width + bidi override chars
    .replace(/\s+/g, ' ')                   // collapse whitespace
    .trim()

  const matches: ScanMatch[] = []
  let highestRisk = 0

  for (const rule of RULES) {
    if (rule.pattern.test(normalizedText)) {
      matches.push({
        category: rule.category,
        description: rule.description,
        risk: rule.risk,
      })

      const riskValue = RISK_HIERARCHY[rule.risk]
      if (riskValue > highestRisk) {
        highestRisk = riskValue
      }
      if (highestRisk === 4) break // CRITICAL found, stop checking remaining rules
    }
  }

  const riskLevel = RISK_FROM_NUMBER[highestRisk]
  const allowed = highestRisk < RISK_HIERARCHY.HIGH

  return { allowed, riskLevel, matches }
}

// ─── User-Facing Safety Message ───────────────────────────────────────────────

/**
 * Returns a user-friendly Chinese warning message based on scan results.
 *
 * @param result - The ScanResult from scanInput()
 * @returns A localized warning string for the user
 */
export function getSafetyMessage(result: ScanResult): string {
  switch (result.riskLevel) {
    case 'SAFE':
      return ''

    case 'LOW':
      return '⚠️ 提示：您的输入包含一些不常见的格式要求，已正常处理。'

    case 'MEDIUM':
      return '⚠️ 安全提示：您的输入中检测到可能的异常内容，部分请求可能被限制。请使用正常对话方式提问。'

    case 'HIGH':
      return '🚫 安全警告：您的输入包含不被允许的指令内容，该请求已被拦截。请正常提问关于日本御宅文化地图的相关问题。'

    case 'CRITICAL':
      return '🚫 严重安全警告：检测到恶意注入攻击，该请求已被拦截并记录。请勿尝试操纵AI系统，如有正常需求请重新提问。'

    default:
      return '⚠️ 输入处理异常，请重试。'
  }
}
