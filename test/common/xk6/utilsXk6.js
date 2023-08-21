export function importXk6File() {
    return importXk6Extension('k6/x/file')
}

export function importXk6Extension(module) {
    try {
        return require(module)
    } catch (x) {
        console.debug(
            `Requesting k6 extension '${module}', but it's not available! Are you executing xk6 having such module built?`
        )
    }
}
