export type Domain = 'food' | 'tech'
const KEY= 'preffered_domain'

export function getPrefferedDomain(): Domain| null {
    const v= localStorage.getItem(KEY)
    return v === 'food' || v === 'tech' ? v: null
}

export function setPrefferedDomain(domain: Domain) {
    localStorage.setItem(KEY, domain)
}