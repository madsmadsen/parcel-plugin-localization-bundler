const JSAsset = require("parcel-bundler/src/assets/JSAsset")
const fs = require("fs")
const path = require("path")
const getConfig = require("./helpers/getConfig")
const syncPromise = require("parcel-bundler/src/utils/syncPromise")
const isLocalization = require("./helpers/isLocalization")
const logger = require('@parcel/logger')

module.exports = class LocalizationJSAsset extends JSAsset {
    constructor(name, opts, ...args) {
        if (!syncPromise(isLocalization(name, opts.rootDir)))
            return new JSAsset(name, opts, ...args)

        super(name, opts, ...args)
    }

    async collectDependencies() {
        super.collectDependencies()

        // Get localization configuration from package
        const config = await getConfig(this.options.rootDir)
        const localizationPath = config
            ? config.sourcePath
            : "localizations"
        const absLocalizationPath = path.join(this.options.rootDir, localizationPath)

        // Verify there is any localization files, otherwise just bail
        if (!fs.existsSync(absLocalizationPath))
        {
            logger.warn(`[parcel-plugin-localization-bundler]: No localization files found.`)
            return
        }

        // Find all languages
        const languages = fs.readdirSync(absLocalizationPath, { withFileTypes: true })
        for (const language of languages) {
            if (!language.isDirectory())
                continue
            const namespaces = fs.readdirSync(
                path.join(absLocalizationPath, language.name),
                { withFileTypes: true }
            )
            for (const namespace of namespaces) {
                if (!namespace.isDirectory())
                    continue

                const mainLocaleFile = path.join(path.sep, localizationPath, `${language.name}`, path.sep, `${namespace.name}.json`);

                if (!fs.existsSync(path.join(this.options.rootDir, mainLocaleFile)))
                    fs.writeFileSync(path.join(this.options.rootDir, mainLocaleFile), "{}");
                
                this.addDependency(mainLocaleFile, {
                    dynamic: true,
                    watch: false,
                    resolved: path.join(this.options.rootDir, mainLocaleFile),
                    id: mainLocaleFile,
                    namespace: namespace.name,
                    language: language.name
                })
            }
        }
    }
}