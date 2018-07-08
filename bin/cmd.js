const minimist = require("minimist");
const downloadGaodePoi = require("./index");
const fs = require("fs-extra");

const argv = minimist(process.argv.slice(2), {
    string: [
        "target-config",
        "key-config",
        "ouput-dir",
    ],
    boolean: [
        "help"
    ],
    alias: {
        t: "target-config",
        k: "key-config",
        o: "ouput-dir",
        h: "help"
    }
})

if (argv.help) {
    console.log("")
    process.exit(0)
}

if (argv["target-config"] && argv["key-config"] && argv["ouput-dir"]) {
    if (fs.pathExistsSync(argv["target-config"])) {
        if (fs.pathExistsSync(argv["key-config"])) {
            var targetConfig = JSON.parse(fs.readFileSync(argv["target-config"]).toString());
            var keyConfig = JSON.parse(fs.readFileSync(argv["key-config"]).toString());
            downloadGaodePoi(keyConfig, targetConfig, argv["output-dir"]) 
        } else {
            console.error("Cannot find key-config file.")
        }
    } else {
        console.error("Cannot find target-config file.")
    }
} else {
    console.error("Parameters target-config, key-config and ouput-dir are all needed.")
}