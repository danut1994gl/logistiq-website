import { describe, it, expect, afterEach } from 'vitest'
import { isSelfServeEnabled } from './self-serve'

const orig = process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED
afterEach(() => { process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = orig })

describe('isSelfServeEnabled', () => {
  it('is ON only for exactly "true"', () => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = 'true'
    expect(isSelfServeEnabled()).toBe(true)
  })
  it('is OFF when unset', () => {
    delete process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED
    expect(isSelfServeEnabled()).toBe(false)
  })
  it('is OFF for "false"/anything else (fail-closed)', () => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = 'false'
    expect(isSelfServeEnabled()).toBe(false)
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = '1'
    expect(isSelfServeEnabled()).toBe(false)
  })
})
