const KEY_SETTING_DEFAULT_EXPORT = "setting-default-export";
const KEY_SETTING_IMAGE_EXPORT_FORMAT = "setting-image-format";

let settingModal;
let setting_defaultExport;
let setting_imageExportFormat;

function openSettings() {
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
    settingModal.show();
}

window.addEventListener("DOMContentLoaded", (e) => {
    settingModal = document.getElementById("settings-dialog");
    setting_defaultExport = loadFromStorage(KEY_SETTING_DEFAULT_EXPORT, "splan");
    setting_imageExportFormat = loadFromStorage(KEY_SETTING_IMAGE_EXPORT_FORMAT, "image/png");
})