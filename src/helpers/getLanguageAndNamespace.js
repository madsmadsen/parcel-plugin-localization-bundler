const getConfig = require("./getConfig")

module.exports = async (name, rootDir) => {
    const config = await getConfig(rootDir)

    const LANGUAGE_NAMESPACE_RE = new RegExp(
        config.sourcePath +
            "/([\\w]+)\\/([\\w]+)[\\/|\\.]"
    )

    const result = LANGUAGE_NAMESPACE_RE.exec(name)
    if (!result || result.length !== 3)
        return {
            language: null,
            namespace: null
        }

    return {
        language: result[1],
        namespace: result[2]
    }
}