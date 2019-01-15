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
        const translationFiles = this.deepFindTranslations(
            path.join(
                this.options.rootDir,
                config.sourcePath,
                language,
                namespace
            )
        )

        for (const translation of translationFiles) {
            this.addDependency(
                translation,
                {
                    namespace: namespace,
                    basename: path.basename(translation, ".json"),
                    language: language,
                    includedInParent: true,
                    resolved: translation
                }
            )
        }
    }

    deepFindTranslations(currentPath) {
        let results = []
        const translations = fs.readdirSync(
            currentPath,
            {
                withFileTypes: true
            }
        )

        for (const translation of translations) {
            if (translation.isDirectory()) {
                const translationTranslations = this.deepFindTranslations(
                    path.join(currentPath, translation.name)
                )
                results = results.concat(translationTranslations)
                continue
            } else if (translation.isFile()) {
                results.push(path.join(currentPath, translation.name))
            }
        }

        return results
    }

    async generate() {
        await this.loadIfNeeded()
        const { language, namespace } = await getLanguageAndNamespace(this.name, this.options.rootDir)
        const accumulatedLocale = {}
        const config = await getConfig(this.options.rootDir)
        
        // Read main
        accumulatedLocale[namespace] = JSON.parse(this.contents)

        // Read dependencies
        for (const dep of this.dependencies.values()) {
            let mutableAccumulatedLocale = accumulatedLocale

            if (!mutableAccumulatedLocale.hasOwnProperty(dep.namespace))
                mutableAccumulatedLocale[dep.namespace] = {}
            
            mutableAccumulatedLocale = mutableAccumulatedLocale[dep.namespace]

            const parts = dep.name.replace(
                path.join(
                    this.options.rootDir,
                    config.sourcePath,
                    language,
                    namespace
                ), ''
            ).split(path.sep)
            
            while(parts.length > 1) {
                const currentPart = parts.shift()
                if (!currentPart || currentPart === 0)
                    continue
                if (!mutableAccumulatedLocale.hasOwnProperty(currentPart))
                    mutableAccumulatedLocale[currentPart] = {}
                mutableAccumulatedLocale = mutableAccumulatedLocale[currentPart]
            }

            mutableAccumulatedLocale[dep.basename] = JSON.parse(
                fs.readFileSync(dep.resolved)
            )
        }
        let code = `module.exports = ${JSON.stringify(accumulatedLocale)};`

        return {
            js: code
        }
    }
}