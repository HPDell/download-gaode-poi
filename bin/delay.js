"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
function delay(times) {
    return new Promise(function (resolve, reject) { setTimeout(function () { return resolve(); }, times); });
}
exports.delay = delay;
//# sourceMappingURL=delay.js.map