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