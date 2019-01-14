const getConfig = require("./src/helpers/getConfig")
const logger = require('@parcel/logger')

module.exports = async bundler => {
    const config = await getConfig(bundler.options.rootDir)
    if (config) {
        bundler.addAssetType('js', require.resolve('./src/JSAsset'))
        bundler.addAssetType('json', require.resolve('./src/JSONAsset'))
    } else {
        logger.error(`[parcel-plugin-localization-bundler]: Missing configuration in package.json`)
    }
}
