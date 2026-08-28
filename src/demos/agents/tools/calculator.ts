import type { ToolSpec } from '@/demos/agents/types'

/**
 * A small recursive-descent evaluator. Deliberately not `eval` or `Function`:
 * the expression string arrives from a language model, and handing model output
 * to the JS parser would let it run anything the page can run.
 */

type Parser = { src: string; pos: number }

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
}

function skipSpace(p: Parser) {
  while (p.pos < p.src.length && /\s/.test(p.src[p.pos])) p.pos += 1
}

function eat(p: Parser, token: string): boolean {
  skipSpace(p)
  if (p.src.startsWith(token, p.pos)) {
    p.pos += token.length
    return true
  }
  return false
}

/** expression := term (('+' | '-') term)* */
function parseExpression(p: Parser): number {
  let value = parseTerm(p)
  for (;;) {
    if (eat(p, '+')) value += parseTerm(p)
    else if (eat(p, '-')) value -= parseTerm(p)
    else return value
  }
}

/** term := power (('*' | '/' | '%') power)* */
function parseTerm(p: Parser): number {
  let value = parsePower(p)
  for (;;) {
    if (eat(p, '*')) value *= parsePower(p)
    else if (eat(p, '/')) {
      const divisor = parsePower(p)
      if (divisor === 0) throw new Error('division by zero')
      value /= divisor
    } else if (eat(p, '%')) {
      const divisor = parsePower(p)
      if (divisor === 0) throw new Error('division by zero')
      value %= divisor
    } else return value
  }
}

/** power := unary ('^' power)?  — right associative, so 2^3^2 is 2^9. */
function parsePower(p: Parser): number {
  const base = parseUnary(p)
  if (eat(p, '^')) return Math.pow(base, parsePower(p))
  return base
}

function parseUnary(p: Parser): number {
  if (eat(p, '-')) return -parseUnary(p)
  if (eat(p, '+')) return parseUnary(p)
  return parseAtom(p)
}

function parseAtom(p: Parser): number {
  skipSpace(p)

  if (eat(p, '(')) {
    const value = parseExpression(p)
    if (!eat(p, ')')) throw new Error('missing closing parenthesis')
    return value
  }

  const number = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(p.src.slice(p.pos))
  if (number) {
    p.pos += number[0].length
    return Number.parseFloat(number[0])
  }

  const name = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(p.src.slice(p.pos))
  if (name) {
    const identifier = name[0].toLowerCase()
    p.pos += name[0].length

    if (eat(p, '(')) {
      const fn = FUNCTIONS[identifier]
      if (!fn) throw new Error(`unknown function "${identifier}"`)
      const args: number[] = []
      if (!eat(p, ')')) {
        do {
          args.push(parseExpression(p))
        } while (eat(p, ','))
        if (!eat(p, ')')) throw new Error(`missing closing parenthesis after ${identifier}(`)
      }
      return fn(...args)
    }

    if (identifier in CONSTANTS) return CONSTANTS[identifier]
    throw new Error(`unknown name "${identifier}"`)
  }

  throw new Error(`unexpected character at position ${p.pos}`)
}

export function evaluate(expression: string): number {
  if (expression.length > 500) throw new Error('expression is too long')
  const p: Parser = { src: expression, pos: 0 }
  const value = parseExpression(p)
  skipSpace(p)
  if (p.pos !== p.src.length) throw new Error(`unexpected trailing input at position ${p.pos}`)
  if (!Number.isFinite(value)) throw new Error('result is not a finite number')
  return value
}

export const calculator: ToolSpec = {
  name: 'calculate',
  description:
    'Evaluate an arithmetic expression and return the numeric result. Use this for any ' +
    'calculation rather than doing arithmetic in your head, since it is exact. Supports ' +
    '+ - * / % ^, parentheses, the constants pi and e, and the functions sqrt, abs, round, ' +
    'floor, ceil, ln, log, exp, sin, cos, tan, min, max, pow.',
  input_schema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'The expression to evaluate, for example "(1250 * 0.23) / 7".',
      },
    },
    required: ['expression'],
  },
  async run(input) {
    const expression = String(input.expression ?? '')
    return { expression, result: evaluate(expression) }
  },
}
