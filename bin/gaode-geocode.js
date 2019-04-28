#!/usr/bin/env node
const minimist = require("minimist");
const gaodeGeocode = require("./geocode").default;
const saveToCsv = require("./geocode").saveToCsv;
const fs = require("fs-extra");
const path = require("path");
const CSV = {
    parse: require("csv-parse/lib/sync")
};

const argv = minimist(process.argv.slice(2), {
    string: [
        "input-csv",
        "key-config",
        "output-dir",
        "field-address",
        "field-oid"
    ],
    boolean: [
        "help"
    ],
    alias: {
        c: "input-csv",
        k: "key-config",
        o: "output-dir",
        a: "field-address",
        h: "help",
        i: "field-oid"
    }
})

if (argv.help) {
    console.log(`
A node.js module to download Gaode Amap poi data via its open api.

Usase:

download-gaode-poi [options]

Required options:

-c, --input-csv [string]           Set input targets from csv file.
-k, --key-config [string]          Set amap keys.
-o, --output-dir [string]          Set output root dir.
-i, --field-oid [string]           Set unique id field. Default to "id".
-a, --field-address [string]       Set output address field name. Default to "address".

Where: key-config file need to be able to parsed as and Array of
       GaodeApiKey which is declared as
       {
           key: string;     // Amap api key.
       }
`)
    process.exit(0)
}

if (argv["key-config"] && argv["output-dir"]) {
    var targetConfig, keyConfig;
    const fieldAddress = argv["field-address"] || "address";
    const fieldOid = argv["field-oid"] || "id";
    const keyConfigFile = argv["key-config"].trim();
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
    if (argv["input-csv"]) {
        const targetCsvFile = argv["input-csv"].trim();
        if (fs.pathExistsSync(targetCsvFile)) {
            try {
                targetConfig = {
                    addresses: CSV.parse(fs.readFileSync(targetCsvFile).toString(), {
                        columns: true
                    }).map(item => ({
                        ...item,
                        id: item[fieldOid],
                        address: item[fieldAddress]
                    })),
                    fieldAddress: fieldAddress,
                    oid: argv["oid"]
                }
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
                gaodeGeocode(keyConfig, targetConfig).then(function (result) {
                    saveToCsv(result, fieldOid, fieldAddress, path.basename(targetCsvFile, path.extname(targetCsvFile)) + "-geocode", outputDir)
                });
            } catch (error) {
                console.error("Download error \n" + error);
            }
        } else {
            console.error("keyConfig or targetConfig is undefined.");
        }
    }
} else {
    console.error("Parameters input-csv, key-config and ouput-dir are all needed.")
}