const KEY = 'jtrade_token'

export const saveToken = (token) => {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
}

export const getToken = () => localStorage.getItem(KEY) || ''

export const clearToken = () => localStorage.removeItem(KEY)
