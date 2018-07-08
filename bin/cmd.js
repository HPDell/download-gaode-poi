#!/usr/bin/env node
const minimist = require("minimist");
const downloadGaodePoi = require("./index").default;
const fs = require("fs-extra");

const argv = minimist(process.argv.slice(2), {
    string: [
        "target-config",
        "key-config",
        "output-dir",
    ],
    boolean: [
        "help"
    ],
    alias: {
        t: "target-config",
        k: "key-config",
        o: "output-dir",
        h: "help"
    }
})

if (argv.help) {
    console.log(`
A node.js module to download Gaode Amap poi data via its open api.

Usase:

download-gaode-poi [options]

Required options:

-t, --target-config [string]    Set download targets.
-k, --key-config [string]       Set amap keys.
-o, --output-dir [string]       Set output root dir.

Where: target-config file need to be able to parsed as an Array of
       DownloadGaodeTarget which is declared as
       {
           city: string;        // City's name in English, Chinese, or City Code.
           types: Array<{       // Required at least one of id and name.
               id?: string;     // Type Code
               name?: string;   // Type name in Chinese.
           }>;
       }

       key-config file need to be able to parsed as and Array of
       GaodeApiKey which is declared as
       {
           key: string;     // Amap api key.
       }
`)
    process.exit(0)
}

if (argv["target-config"] && argv["key-config"] && argv["output-dir"]) {
    var targetConfig, keyConfig;
    const keyConfigFile = argv["key-config"].trim();
    const targetConfigFile = argv["target-config"].trim();
    const outputDir = argv["output-dir"].trim();
    if (fs.pathExistsSync(keyConfigFile)) {
        try {
            keyConfig = JSON.parse(fs.readFileSync(keyConfigFile).toString());
        } catch (error) {
            console.error("Failed to parse key-config file.");
            process.exit(1);
        }
    } else {
        console.error("Cannot find key-config file.");
        process.exit(1);
    }
    if (fs.pathExistsSync(targetConfigFile)) {
        try {
            targetConfig = JSON.parse(fs.readFileSync(targetConfigFile).toString());
        } catch (error) {
            console.error("Failed to parse target-config file.");
            process.exit(1);
        }
    } else {
        console.error("Cannot find target-config file.");
        process.exit(1);
    }
    if (keyConfig && targetConfig) {
        try {
            downloadGaodePoi(keyConfig, targetConfig, outputDir) 
        } catch (error) {
            console.error("Download error \n" + error);
        }
    } else {
        console.error("keyConfig or targetConfig is undefined.");
    }
} else {
    console.error("Parameters target-config, key-config and ouput-dir are all needed.")
}