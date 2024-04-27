const KEY_RULES = "rules";
const KEY_LAST_FILENAME = "last_filename_export";
const KEY_PRINT_TITLE = "print_title"

const KEY_ROOM_WIDTH = "room_width";
const KEY_ROOM_HEIGHT = "room_height";
const KEY_ROOM = "room";
const KEY_STUDENT = "students";

function saveClass() {
    if (!className) {
        console.log("No class name", className, "Reject saving");
        return;
    }
    let key = "class_" + window.encodeURIComponent(className);
    console.debug("Save class to ", key);
    localStorage.setItem(key, JSON.stringify({
        name: className,
        rules: JSON.parse(sessionStorage.getItem(KEY_RULES)) || {},
        room: JSON.parse(sessionStorage.getItem(KEY_ROOM)) || {},
        students: JSON.parse(sessionStorage.getItem(KEY_STUDENT)) || [],
        width: JSON.parse(sessionStorage.getItem(KEY_ROOM_WIDTH)) || 9,
        height: JSON.parse(sessionStorage.getItem(KEY_ROOM_HEIGHT)) || 7,
        lastFilename: JSON.parse(sessionStorage.getItem(KEY_LAST_FILENAME))
    }));
}

function deleteClass(name) {
    if (!name) {
        console.log("No class existing")
    }
    localStorage.removeItem("class_" + window.encodeURIComponent(name));
}

let className = new URLSearchParams(window.location.search).get("className") || undefined;
console.debug("Load class", className);
const storage = className ? window.sessionStorage : window.localStorage;
console.debug("Using", storage);
if (className) {
    console.debug("Loading class data...");
    let classDataItem = localStorage.getItem("class_" + window.encodeURIComponent(className)) || undefined;
    if (!classDataItem) {
        sessionStorage.clear();
    }
    else {
        let classData = JSON.parse(classDataItem);
        saveToStorage(KEY_RULES, classData.rules ?? {});
        saveToStorage(KEY_ROOM, classData.room ?? {});
        saveToStorage(KEY_ROOM_WIDTH, classData.width ?? 9);
        saveToStorage(KEY_ROOM_HEIGHT, classData.height ?? 7);
        saveToStorage(KEY_STUDENT, classData.students ?? []);
        saveToStorage(KEY_PRINT_TITLE, classData.name ?? "");
        saveToStorage(KEY_LAST_FILENAME, classData.lastFilename);
    }
}


function loadFromStorage(key, def) {
    const value = storage.getItem(key);
    if (value == null) {
        saveToStorage(key, def);
        return def;
    }
    else if (value === "undefined") {
        return def;
    }
    return JSON.parse(value);
}

function saveToStorage(key, value) {
    storage.setItem(key, JSON.stringify(value));
    if (className) {
        saveClass();
    }
}

function clearStorage(e) {
    if (!confirm("Möchten sie wirklich alle Daten löschen? Falls sie ihren aktuellen Stand bisher nicht in eine Porjektdatei (.splan) exportiert haben, ist dieser nicht wieder herstellbar!")) {
        return;
    }
    storage.clear();
    window.location.reload();
}
