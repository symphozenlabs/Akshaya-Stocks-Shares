import { describe, expect, it } from 'vitest'
import { csvRowToCustomer, filterCustomers, normalizeCustomer, normalizeUsername, rowsToCsv, teamEmailForUsername, todaysBirthdays, validateCustomer } from './lib'

const valid = { name: 'Anand Kumar', phone: '9150328704', email: '', aadhaar: '123412341234', address: '12 Anna Salai, Salem', pincode: '636004', voterId: 'ABC1234567', rationCardNo: '12G3456789', pan: 'ABCDE1234F', tradingCode: '', referredBy: '', product: 'Shares', cibilType: '', dob: '1990-10-12' }

describe('customer helpers', () => {
  it('normalizes PAN and names', () => expect(normalizeCustomer({ ...valid, pan: 'abcde1234f' })).toMatchObject({ pan: 'ABCDE1234F', nameLower: 'anand kumar' }))
  it('requires PAN for shares', () => expect(validateCustomer({ ...valid, pan: '' }).errors.pan).toBeTruthy())
  it('allows empty PAN for forex', () => expect(validateCustomer({ ...valid, product: 'Forex / Dollar', pan: '' }).valid).toBe(true))
  it('allows blank optional identity details and validates supplied values', () => {
    expect(validateCustomer({ ...valid, aadhaar: '', address: '', pincode: '', voterId: '', rationCardNo: '' }).valid).toBe(true)
    expect(validateCustomer({ ...valid, aadhaar: '123' }).errors.aadhaar).toBeTruthy()
    expect(validateCustomer({ ...valid, pincode: '123' }).errors.pincode).toBeTruthy()
  })
  it('requires a credit bureau type for Cibil customers', () => {
    expect(validateCustomer({ ...valid, product: 'Cibil', pan: '', cibilType: '' }).errors.cibilType).toBeTruthy()
    expect(validateCustomer({ ...valid, product: 'Cibil', pan: '', cibilType: 'Experian' }).valid).toBe(true)
  })
  it('filters Cibil customers separately', () => {
    const customers = [{ ...valid, product: 'Shares', archived: false }, { ...valid, name: 'Bala', product: 'Cibil', cibilType: 'CRIF', archived: false }]
    expect(filterCustomers(customers, '', 'Cibil').map((x) => x.name)).toEqual(['Bala'])
  })
  it('preserves extended identity fields through CSV mapping', () => {
    const [row] = rowsToCsv([valid])
    expect(csvRowToCustomer(row)).toMatchObject({ aadhaar: valid.aadhaar, address: valid.address, voterId: valid.voterId, rationCardNo: valid.rationCardNo })
  })
  it('normalizes team usernames into internal Firebase identities', () => {
    expect(normalizeUsername('  Salem.Team-1 ')).toBe('salem.team-1')
    expect(teamEmailForUsername('Salem.Team-1')).toBe('salem.team-1@team.akshaya-ss.app')
  })
  it('searches and sorts active customers', () => {
    const result = filterCustomers([{ ...valid, name: 'Zara', archived: false }, { ...valid, name: 'Arun', archived: false }], '915', 'All')
    expect(result.map((x) => x.name)).toEqual(['Arun', 'Zara'])
  })
  it('finds birthdays by month and day', () =>
    expect(
      todaysBirthdays([{ ...valid, archived: false }], new Date('2026-10-12T10:00:00+05:30')).length,
    ).toBe(1),
  )
})
