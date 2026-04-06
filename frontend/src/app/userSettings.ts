import type {Domain} from '../config/domains'

const KEY= 'preffered_domain'

export function getPrefferedDomain(): Domain| null {
    const v= localStorage.getItem(KEY) as Domain
    return v && v.startsWith('CP') ? v: null
}

export function setPrefferedDomain(domain: Domain) {
    localStorage.setItem(KEY, domain)
}

export type {Domain}