const KEY_SETTING_DEFAULT_EXPORT = "setting-default-export";
const KEY_SETTING_IMAGE_EXPORT_FORMAT = "setting-image-format";
const KEY_SETTING_ALOG_RANDOMNESS = "setting-algo-randomness";
const KEY_DELETE_TABLE_ON_CLICK = "setting-delete-table-on-click";
const KEY_SCROLLBAR_BEHAVIOUR = "setting-scrollbar-behaviour";

const DELETE_TABLE_ON_CLICK = 0;
const KEEP_TABLE_ON_CLICK = 1;

let settingModal;
let setting_imageExportFormat = "image/png";
let setting_algo_randomness = 2;
let setting_delete_table_on_click = 1;
let setting_scrollbar_behaviour = 0;

function openSettings() {
    settingModal.showModal();
}

function closeDialog(e) { 
    console.log(e);
    if (e.target.tagName != "DIALOG") {
        return;
    }
    if (e.clientX < e.target.offsetLeft || e.clientX > e.target.offsetLeft + e.target.offsetWidth || e.clientY < e.target.offsetTop || e.clientY > e.target.offsetTop + e.target.offsetHeight) {
        e.target.close();
    }
}

function tableSizing() {
        console.debug("adjust tables");
        for (table of document.querySelectorAll("#room-table .table")) {
            if (setting_scrollbar_behaviour === 0) {
                table.style.height = (document.body.clientHeight - 260) / roomHeight + "px"; 
            }
            else {
                table.style.removeProperty("height");
            }
        }
}

window.addEventListener("DOMContentLoaded", (e) => {
    settingModal = document.getElementById("settings-dialog");
    setting_imageExportFormat = loadFromStorage(KEY_SETTING_IMAGE_EXPORT_FORMAT, "image/png");
    setting_algo_randomness = loadFromStorage(KEY_SETTING_ALOG_RANDOMNESS, 2);
    setting_delete_table_on_click = loadFromStorage(KEY_DELETE_TABLE_ON_CLICK, 1);
    setting_scrollbar_behaviour = loadFromStorage(KEY_SCROLLBAR_BEHAVIOUR, 0);

    let image_export_type = settingModal.querySelector("#setting-export-format");
    image_export_type.value = setting_imageExportFormat;
    image_export_type.addEventListener("change", (e) => {
        setting_imageExportFormat = e.target.value;
        saveToStorage(KEY_SETTING_IMAGE_EXPORT_FORMAT, setting_imageExportFormat);
    });

    let algo_randomness = settingModal.querySelector("#setting-algo-randomness");
    algo_randomness.value = setting_algo_randomness;
    algo_randomness.addEventListener("change", (e) => {
        setting_algo_randomness = parseInt(algo_randomness.value);
        if (isNaN(setting_algo_randomness)) {
            algo_randomness.value = 2;
            setting_algo_randomness = 2;
        }
        saveToStorage(KEY_SETTING_ALOG_RANDOMNESS, setting_algo_randomness);
    })

    let tableBehaviour = document.getElementById("setting-delete-table-on-click");
    tableBehaviour.value = setting_delete_table_on_click;
    tableBehaviour.addEventListener("change", (e) => {
        setting_delete_table_on_click = parseInt(tableBehaviour.value);
        if (isNaN(setting_delete_table_on_click)) {
            tableBehaviour.value = 1;
            setting_delete_table_on_click = 1;
        }
        saveToStorage(KEY_DELETE_TABLE_ON_CLICK, setting_delete_table_on_click);
    });

    let scrollBehaviour = document.getElementById("setting-scrollbar-behaviour");
    scrollBehaviour.value = setting_scrollbar_behaviour;
    scrollBehaviour.addEventListener("change", (e) => {
        setting_scrollbar_behaviour = parseInt(scrollBehaviour.value);
        if (isNaN(setting_scrollbar_behaviour)) {
            scrollBehaviour.value = 0;
            setting_scrollbar_behaviour = 0;
        }
        console.debug("hello");
        if (setting_scrollbar_behaviour === 0) {
            document.getElementById("room-table").classList.add("no-scroll");
        } else {
            document.getElementById("room-table").classList.remove("no-scroll");
        }
        tableSizing();
        saveToStorage(KEY_SCROLLBAR_BEHAVIOUR, setting_scrollbar_behaviour);
    })

    if (setting_scrollbar_behaviour === 0) {
        document.getElementById("room-table").classList.add("no-scroll");
    }
    tableSizing();
})

window.addEventListener("resize", (e) => { tableSizing(); });