export type Theme = 'light' | 'dark'
const KEY = 'theme'

export function getInitialTheme(): Theme{
    const saved= localStorage.getItem(KEY) as Theme | null
    if(saved === 'light' || saved === 'dark'){
        return saved;
    }

    return 'light';
}

export function applyTheme(theme: Theme){
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
}