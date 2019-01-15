const JSONAsset = require("parcel-bundler/src/assets/JSONAsset")
const Asset = require("parcel-bundler/src/Asset")
const syncPromise = require("parcel-bundler/src/utils/syncPromise")
const isLocalization = require("./helpers/isLocalization")
const getConfig = require("./helpers/getConfig")
const getLanguageAndNamespace = require("./helpers/getLanguageAndNamespace")
const path = require("path")
const fs = require("fs")
const logger = require('@parcel/logger')

module.exports = class LocalizationJSONAsset extends Asset {
    constructor(name, opts, ...args) {
        if (!syncPromise(isLocalization(name, opts.rootDir))) {
            return new JSONAsset(name, opts, ...args)
        }

        super(name, opts, ...args)
        this.type = 'js'
    }

    shouldInvalidate() {
        return true
    }

    async collectDependencies() {
        const config = await getConfig(this.options.rootDir)
        const { language, namespace } = await getLanguageAndNamespace(this.name, this.options.rootDir)
        const translations = fs.readdirSync(
            path.join(
                this.options.rootDir,
                config.sourcePath,
                language,
                namespace
            ),
            {
                withFileTypes: true
            }
        );
        
        for (const translation of translations) {
            if (translation.isDirectory())
            {
                logger.error(
                    `Unsupported depth of translations: '${translation.name}`
                )
                continue
            }

            this.addDependency(
                path.join(this.options.rootDir,
                    config.sourcePath, language, namespace, translation.name),
                {
                    namespace: namespace,
                    basename: translation.name.replace(".json", ""),
                    language: language,
                    resolved: path.join(
                        this.options.rootDir,
                        config.sourcePath,
                        language,
                        namespace,
                        translation.name
                    ),
                    includedInParent: true
                }
            );
        }
    }

    async generate() {
        await this.loadIfNeeded()
        const { langauge, namespace } = await getLanguageAndNamespace(this.name, this.options.rootDir)
        const accumulatedLocale = {}

        // Read main
        accumulatedLocale[namespace] = JSON.parse(this.contents)

        // Read dependencies
        for (const dep of this.dependencies.values()) {
            if (!accumulatedLocale.hasOwnProperty(dep.namespace))
                accumulatedLocale[dep.namespace] = {}

            accumulatedLocale[dep.namespace][dep.basename] = JSON.parse(
                fs.readFileSync(dep.resolved)
            )
        }
        let code = `module.exports = ${JSON.stringify(accumulatedLocale)};`

        return {
            js: code
        }
    }
};
