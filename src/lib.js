export const PRODUCTS = ['Shares', 'Mutual Funds', 'Forex / Dollar', 'Other Investments', 'Cibil']
export const CIBIL_TYPES = ['Cibil', 'CRIF', 'Experian', 'Equifax']
export const productLabel = value => value === 'Cibil' || value === 'CIC' ? 'CIC' : value
export const TEAM_EMAIL_DOMAIN = 'team.akshaya-ss.app'

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase()
}

export function teamEmailForUsername(value) {
  return `${normalizeUsername(value)}@${TEAM_EMAIL_DOMAIN}`
}

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
  const inputProduct = String(input.product || '').trim()
  const product = inputProduct.toUpperCase() === 'CIC' ? 'Cibil' : inputProduct
  return {
    name: String(input.name || '').trim(),
    nameLower: String(input.name || '').trim().toLocaleLowerCase('en-IN'),
    phone: String(input.phone || '').replace(/[^0-9+]/g, ''),
    email: String(input.email || '').trim().toLowerCase(),
    pan: String(input.pan || '').trim().toUpperCase(),
    tradingCode: String(input.tradingCode || '').trim().toUpperCase(),
    referredBy: String(input.referredBy || '').trim(),
    aadhaar: String(input.aadhaar || '').replace(/\D/g, ''),
    address: String(input.address || '').trim(),
    pincode: String(input.pincode || '').replace(/\D/g, ''),
    voterId: String(input.voterId || '').trim().toUpperCase(),
    rationCardNo: String(input.rationCardNo || '').trim().toUpperCase(),
    product,
    cibilType: product === 'Cibil' ? String(input.cibilType || '').trim() : '',
    dob: String(input.dob || '').trim(),
  }
}

export function validateCustomer(input) {
  const c = normalizeCustomer(input)
  const errors = {}
  if (c.name.length < 2) errors.name = 'Enter the customer’s full name.'
  if (!/^\+?[0-9]{7,15}$/.test(c.phone)) errors.phone = 'Enter a valid phone number.'
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errors.email = 'Enter a valid email address.'
  if (c.aadhaar && !/^\d{12}$/.test(c.aadhaar)) errors.aadhaar = 'Use a valid 12-digit Aadhaar number.'
  if (c.address && c.address.length < 5) errors.address = 'Enter a complete address or leave it blank.'
  if (c.pincode && !/^[1-9][0-9]{5}$/.test(c.pincode)) errors.pincode = 'Use a valid 6-digit Indian pincode.'
  if (c.voterId && !/^[A-Z0-9/-]{6,20}$/.test(c.voterId)) errors.voterId = 'Use a valid voter ID number.'
  if (c.rationCardNo && !/^[A-Z0-9 /-]{3,30}$/.test(c.rationCardNo)) errors.rationCardNo = 'Use a valid ration card number.'
  if (!PRODUCTS.includes(c.product)) errors.product = 'Select an investment product.'
  if (c.product === 'Cibil' && !CIBIL_TYPES.includes(c.cibilType)) errors.cibilType = 'Select a CIBIL type.'
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
      if (filter === 'Cibil' || filter === 'CIC') return c.product === 'Cibil' || c.product === 'CIC'
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
    Aadhaar: c.aadhaar,
    Address: c.address,
    Pincode: c.pincode,
    'Voter ID No': c.voterId,
    'Ration Card No': c.rationCardNo,
    Product: productLabel(c.product),
    'Cibil Type': c.cibilType,
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
    aadhaar: row.Aadhaar || row.Aadhar || row.aadhaar || row.aadhar,
    address: row.Address || row.address,
    pincode: row.Pincode || row['Pin Code'] || row.pincode,
    voterId: row['Voter ID No'] || row['Voter Id No'] || row.voterId,
    rationCardNo: row['Ration Card No'] || row.rationCardNo,
    product: row.Product || row.product,
    cibilType: row['Cibil Type'] || row['CIBIL Type'] || row.cibilType,
    referredBy: row['Ref by'] || row['Referred by'] || row.referredBy,
    dob: row.DOB || row.dob,
  })
}
