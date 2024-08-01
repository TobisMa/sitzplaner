function loadClassForEditing(name, loadPage) {
    console.debug(name, loadPage);
    console.debug("^")
    if (!name) {
        console.error("Null name");
        return;
    }

    let url = window.location.origin + window.location.pathname + "planer.html" + "?className=" + window.encodeURIComponent(name);
    url.replace("//", "/")  // idc in this project
    console.debug(url);
    window.location.assign(url);
}
