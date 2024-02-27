const storage = {
};

function loadFromStorage(key, def) {
    const value = localStorage.getItem(key);
    if (value == null) {
        saveToStorage(key, def);
        return def;
    }
    return JSON.parse(value);
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function clearStorage(e) {
    if (!confirm("Möchten sie wirklich alle Daten löschen? Falls sie ihren aktuellen Stand bisher nicht in eine Porjektdatei (.splan) exportiert haben, ist dieser nicht wieder herstellbar!")) {
        return;
    }
    localStorage.clear();
    window.location.reload();
}