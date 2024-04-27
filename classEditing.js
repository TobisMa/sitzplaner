function loadClassForEditing(name, loadPage) {
    console.debug(name, loadPage);
    console.debug("^")
    if (!name) {
        console.error("Null name");
        return;
    }

    let url = new URL("planer.html", window.location.origin);
    url.search = "?className=" + window.encodeURIComponent(name);
    console.debug(url);
    window.location.assign(url);
}