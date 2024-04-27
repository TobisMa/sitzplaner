const KEY_CLASS_NAMES = "class_names";

let templ_class;
let classListContainer;
let classNames = [];


function addClassHandler(e) {
    e.preventDefault();
    let input = document.querySelector("#class-add-container input");
    let name = input.value;
    if (!name || classNames.includes(name)) {
        return;
    }
    createClassHTML(name);
    input.value = "";
    classNames.push(name);
    saveToStorage(KEY_CLASS_NAMES, classNames);
}

function createClassHTML(name) {
    let frag = templ_class.content.cloneNode(true);
    let container = frag.querySelector(".class-container");
    container.addEventListener("click", e => {
        loadClassForEditing(container.querySelector(".class-name").innerText, true);
    });

    let classNameDiv = frag.querySelector(".class-name");
    classNameDiv.innerText = name;

    let editBtn = frag.querySelector("button.edit");
    editBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        let newName = window.prompt("Neuer Klassenname:", name);
        if (!newName || classNames.includes(newName)) {
            return;
        }
        classNameDiv.innerText = newName;
        classNames[classNames.indexOf(name)] = newName;
        saveToStorage(KEY_CLASS_NAMES, classNames);
    });

    let deleteBtn = frag.querySelector("button.delete");
    deleteBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        classNames.splice(classNames.indexOf(name), 1);
        for (const node of classListContainer.childNodes) {
            if (node.nodeName === "#text") {
                continue;
            }
            else if (node.querySelector(".class-name").innerText === name) {
                classListContainer.removeChild(node);
                deleteClass(name);
                break;
            }
        }
        saveToStorage(KEY_CLASS_NAMES, classNames);
    });

    classListContainer.appendChild(frag);
}


function deleteAllClasses() {
    classNames = [];
    while (classListContainer.children.length) {
        classListContainer.removeChild(classListContainer.firstElementChild);
    }
    saveToStorage(KEY_CLASS_NAMES, classNames);
}

function loadClasses(classes) {
    deleteAllClasses();
    for (const name of classes) {
        createClassHTML(name);
    }
    classNames = classes;
    saveToStorage(KEY_CLASS_NAMES, classes);
}

window.addEventListener("DOMContentLoaded", e => {
    templ_class = document.getElementById("templ-class-container");
    classListContainer = document.getElementById("class-list-container");
    classNames = loadFromStorage(KEY_CLASS_NAMES, []);
    loadClasses(classNames);
})