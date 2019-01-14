# 📦🚀 parcel-plugin-localization-bundler

A plugin that bundles localization files into one bundle per namespace and language

The structur must be `${language}/${namespace}/localeFile.json`

Eg. the following locale structur

```
/en/pages.json
/en/pages/1.json
/en/pages/2.json
/en/pages/3.json
/en/plugins.json
/en/plugins/1.json
/en/plugins/2.json
/en/plugins/3.json
/de/pages.json
/de/pages/1.json
/de/pages/2.json
/de/pages/3.json
/de/plugins.json
/de/plugins/1.json
/de/plugins/2.json
/de/plugins/3.json
```
Would result in 4 bundles, one for each namespace; `pages` and `plugins`, and one for each language of the given namespace, `en` and `de`.

# Setup

```
npm i parcel-plugin-localization-bundler
```

There must be a `parcel-plugin-localization-bundler` section in your `package.json`, containing:
```json
...
"parcel-plugin-localization-bundler": {
    "entryFile": "index.tsx",
    "sourcePath": "localizations"
}
...
```
The entryFile determines which file in your project that the new bundles should be dynamic dependencies of.