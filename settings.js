const KEY_SETTING_DEFAULT_EXPORT = "setting-default-export";
const KEY_SETTING_IMAGE_EXPORT_FORMAT = "setting-image-format";
const KEY_SETTING_ALOG_RANDOMNESS = "setting-algo-randomness";

let settingModal;
let setting_defaultExport;
let setting_imageExportFormat;
let setting_algo_randomness;

function openSettings() {
    settingModal.showModal();
}

window.addEventListener("DOMContentLoaded", (e) => {
    settingModal = document.getElementById("settings-dialog");
    setting_defaultExport = loadFromStorage(KEY_SETTING_DEFAULT_EXPORT, "splan");
    setting_imageExportFormat = loadFromStorage(KEY_SETTING_IMAGE_EXPORT_FORMAT, "image/png");
    setting_algo_randomness = loadFromStorage(KEY_SETTING_ALOG_RANDOMNESS, 2);

    let defaultExport = settingModal.querySelector("#setting-default-export");
    defaultExport.value = setting_defaultExport;
    defaultExport.addEventListener("change", (e) => {
        setting_defaultExport = e.target.value;
        saveToStorage(KEY_SETTING_DEFAULT_EXPORT, setting_defaultExport);
    });

    let image_export_type = settingModal.querySelector("#setting-export-format");
    image_export_type.value = setting_imageExportFormat;
    image_export_type.addEventListener("change", (e) => {
        setting_imageExportFormat = e.target.value;
        saveToStorage(KEY_SETTING_IMAGE_EXPORT_FORMAT, setting_imageExportFormat);
    });

    let algo_randomness = settingModal.querySelector("#setting-algo-randomness");
    algo_randomness.value = setting_algo_randomness;
    algo_randomness.addEventListener("change", (e) => {
        console.log("chnage");
        setting_algo_randomness = parseInt(algo_randomness.value);
        if (isNaN(setting_algo_randomness)) {
            algo_randomness.value = 2;
            setting_algo_randomness = 2;
        }
        saveToStorage(KEY_SETTING_ALOG_RANDOMNESS, setting_algo_randomness);
    })

})