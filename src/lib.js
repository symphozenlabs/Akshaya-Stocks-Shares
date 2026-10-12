export const PRODUCTS = ['Shares', 'Mutual Funds', 'Forex / Dollar', 'Other Investments']

export function dobToIso(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeCustomer(input) {
  const product = String(input.product || '').trim()
  return {
    name: String(input.name || '').trim(),
    nameLower: String(input.name || '').trim().toLocaleLowerCase('en-IN'),
    phone: String(input.phone || '').replace(/[^0-9+]/g, ''),
    email: String(input.email || '').trim().toLowerCase(),
    pan: String(input.pan || '').trim().toUpperCase(),
    tradingCode: String(input.tradingCode || '').trim().toUpperCase(),
    referredBy: String(input.referredBy || '').trim(),
    product,
    dob: String(input.dob || '').trim(),
  }
}

export function validateCustomer(input) {
  const c = normalizeCustomer(input)
  const errors = {}
  if (c.name.length < 2) errors.name = 'Enter the customer’s full name.'
  if (!/^\+?[0-9]{7,15}$/.test(c.phone)) errors.phone = 'Enter a valid phone number.'
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errors.email = 'Enter a valid email address.'
  if (!PRODUCTS.includes(c.product)) errors.product = 'Select an investment product.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.dob)) errors.dob = 'Date of birth is required.'
  const needsPan = c.product === 'Shares' || c.product === 'Mutual Funds'
  if (needsPan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(c.pan)) errors.pan = 'A valid PAN is required for shares and mutual funds.'
  if (c.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(c.pan)) errors.pan = 'Use the PAN format ABCDE1234F.'
  return { customer: c, errors, valid: Object.keys(errors).length === 0 }
}

export function filterCustomers(customers, search, filter, includeArchived = false) {
  const q = search.trim().toLocaleLowerCase('en-IN')
  return customers
    .filter((c) => Boolean(c.archived) === includeArchived)
    .filter((c) => {
      if (filter === 'All') return true
      if (filter === 'Forex') return c.product === 'Forex / Dollar'
      if (filter === 'Others') return c.product === 'Other Investments'
      return c.product === filter
    })
    .filter((c) => !q || [c.name, c.phone, c.email, c.pan].some((value) => String(value || '').toLocaleLowerCase('en-IN').includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'en-IN', { sensitivity: 'base' }))
}

export function todaysBirthdays(customers, today = new Date()) {
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return customers.filter((c) => !c.archived && dobToIso(c.dob).slice(5) === `${month}-${day}`)
}

export function rowsToCsv(customers) {
  return customers.map((c, index) => ({
    'S. No': index + 1,
    Name: c.name,
    'Phone No': c.phone,
    'Email Id': c.email,
    'Pan Card No': c.pan,
    'Trading Code': c.tradingCode,
    Product: c.product,
    'Ref by': c.referredBy,
    DOB: dobToIso(c.dob),
    Status: c.archived ? 'Archived' : 'Active',
  }))
}

export function csvRowToCustomer(row) {
  return normalizeCustomer({
    name: row.Name || row.name,
    phone: row['Phone No'] || row.phone || row['Phone Number'],
    email: row['Email Id'] || row.email,
    pan: row['Pan Card No'] || row.pan,
    tradingCode: row['Trading Code'] || row.tradingCode,
    product: row.Product || row.product,
    referredBy: row['Ref by'] || row['Referred by'] || row.referredBy,
    dob: row.DOB || row.dob,
  })
}
