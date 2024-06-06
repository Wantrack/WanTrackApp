function encode (text) {
    return btoa(text)
}

function decode (text) {
    return atob(text)
}

export { encode, decode }