const path = require("path")
const fs = require("fs")

module.exports = async (rootDir) => {
    let currentPath = path.dirname(rootDir)
    let pkg = null
    while (!pkg) {
        const currentTest = path.resolve(currentPath, "package.json")
        if (!fs.existsSync(currentTest)) {
            const nextPath = path.resolve(currentPath, "..")
            if (nextPath === path.dirname(currentTest))
                throw new Error("Couldn't load package configuration")
            currentPath = nextPath
            continue
        }
        pkg = require(currentTest)
    }

    return pkg["parcel-plugin-localization-bundler"]
        ? pkg["parcel-plugin-localization-bundler"]
        : null
}