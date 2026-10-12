import { describe, expect, it } from 'vitest'
import { filterCustomers, normalizeCustomer, todaysBirthdays, validateCustomer } from './lib'

const valid = { name: 'Anand Kumar', phone: '9842744955', email: '', pan: 'ABCDE1234F', tradingCode: '', referredBy: '', product: 'Shares', dob: '1990-10-12' }

describe('customer helpers', () => {
  it('normalizes PAN and names', () => expect(normalizeCustomer({ ...valid, pan: 'abcde1234f' })).toMatchObject({ pan: 'ABCDE1234F', nameLower: 'anand kumar' }))
  it('requires PAN for shares', () => expect(validateCustomer({ ...valid, pan: '' }).errors.pan).toBeTruthy())
  it('allows empty PAN for forex', () => expect(validateCustomer({ ...valid, product: 'Forex / Dollar', pan: '' }).valid).toBe(true))
  it('searches and sorts active customers', () => {
    const result = filterCustomers([{ ...valid, name: 'Zara', archived: false }, { ...valid, name: 'Arun', archived: false }], '98', 'All')
    expect(result.map((x) => x.name)).toEqual(['Arun', 'Zara'])
  })
  it('finds birthdays by month and day', () =>
    expect(
      todaysBirthdays([{ ...valid, archived: false }], new Date('2026-10-12T10:00:00+05:30')).length,
    ).toBe(1),
  )
})
