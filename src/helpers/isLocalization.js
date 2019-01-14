const path = require("path")
const os = require("os")
const getConfig = require("./getConfig")

module.exports = async (name, rootDir) => {
    const config = await getConfig(rootDir)
    const entryFile = config.entryFile
    const entryFileWithoutExt = entryFile.replace(/\.[^/.]+$/, "")

    return (
        name.indexOf(
            path.join(
                rootDir,
                config.sourcePath
            )
        ) > -1 ||
        name.indexOf(
            path.join(
                os.tmpdir(),
                config.sourcePath
            )
        ) > -1 ||
        name.indexOf(entryFile) > -1 ||
        name.indexOf(entryFileWithoutExt) > -1
    )
}