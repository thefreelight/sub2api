import { describe, expect, it } from 'vitest'

import en from '../locales/en'
import zh from '../locales/zh'

describe('admin table and proxy form locale keys', () => {
  it('contains zh labels used by account and proxy admin screens', () => {
    expect(zh.admin.accounts.columns.id).toBe('ID')
    expect(zh.admin.accounts.columns.createdAt).toBe('创建时间')
    expect(zh.admin.proxies.columns.expiry).toBe('到期时间')
    expect(zh.admin.proxies.columns.createdAt).toBe('创建时间')
    expect(zh.admin.proxies.expiresAt).toBe('到期时间')
    expect(zh.admin.proxies.nDays).toBe('{days} 天')
    expect(zh.admin.proxies.fallbackMode).toBe('到期后处理')
    expect(zh.admin.proxies.fallbackNone).toBe('不处理')
  })

  it('contains en labels used by account and proxy admin screens', () => {
    expect(en.admin.accounts.columns.id).toBe('ID')
    expect(en.admin.accounts.columns.createdAt).toBe('Created At')
    expect(en.admin.proxies.columns.expiry).toBe('Expiry')
    expect(en.admin.proxies.columns.createdAt).toBe('Created At')
    expect(en.admin.proxies.expiresAt).toBe('Expires At')
    expect(en.admin.proxies.nDays).toBe('{days} days')
    expect(en.admin.proxies.fallbackMode).toBe('After Expiry')
    expect(en.admin.proxies.fallbackNone).toBe('Do nothing')
  })
})
