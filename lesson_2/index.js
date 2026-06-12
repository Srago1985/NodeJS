const validateEcmascriptText = text => {
    const pattern = /^ *ecmascript([1-9]|1[0-6])?$/i;
    return pattern.test(text);
}


const validateDomainZone = text => {
    // const pattern = /^.+\.(com|org|il)$/i
    // const pattern = /^[a-z0-9_.-]+\.(com|org|il)$/i
    const pattern = /^\w(\w|[.-])*\.(com|org|il)$/i
    return pattern.test(text);
}

export { validateEcmascriptText, validateDomainZone };