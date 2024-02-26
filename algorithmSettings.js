let template_studentListContextMenu;
let template_sittingRulesDialog;
let template_ruleSingleStudent;
let template_studentCombinationItem;

let sitWithRule = {};
let forbiddenNeighboursRule = {};
let firstRowRule = [];
let notLastRowRule = [];
let contextMenuOpen = false;

const KEY_RULES = "rules";

function updateRulesToStorage() {
    saveToStorage(KEY_RULES, {
        sitWith: sitWithRule,
        forbiddenNeighbours: forbiddenNeighboursRule,
        firstRow: firstRowRule,
        notLastRow: notLastRowRule
    });
    buildDialogDataLists();
}

function buildDialogDataLists() {
    // update data lists
    let dialog = document.querySelector("#sitting-rules");
    if (dialog === null) {
        console.debug("Datalist build failed. No dialog");
        return;
    }
    let firstRowDl = document.querySelector("#student-in-front");
    firstRowDl.innerHTML = ""; // clear
    globalStudents.forEach(name => {
        if (firstRowRule.includes(name)) {
            return;
        }
        let opt = document.createElement("option");
        opt.value = name;
        opt.innerText = name;
        firstRowDl.appendChild(opt);
    })
    let notLastRowDl = document.querySelector("#student-not-in-back");
    notLastRowDl.innerHTML = ""; // clear
    globalStudents.forEach(name => {
        if (notLastRowRule.includes(name)) {
            return;
        }
        let opt = document.createElement("option");
        opt.value = name;
        opt.innerText = name;
        notLastRowDl.appendChild(opt);
    })
}


function toggleFirstRow(name) {
    if (firstRowRule.includes(name)) {
        firstRowRule.splice(firstRowRule.indexOf(name), 1);
    }
    else {
        firstRowRule.push(name);
    }
    updateRulesToStorage();
}

function toggleNotLastRow(name) {
    if (notLastRowRule.includes(name)) {
        notLastRowRule.splice(notLastRowRule.indexOf(name), 1);
    }
    else {
        notLastRowRule.push(name);
    }
    updateRulesToStorage();
}


function openContextMenu(e) {
    if (contextMenuOpen) {
        return;
    }
    contextMenuOpen = true;
    let menu = template_studentListContextMenu.content.cloneNode(true);
    let containerNode = menu.querySelector("#student-contextmenu");

    let studentName;
    if (e.target.classList.contains("student-name")) {
        studentName = e.target.innerText;
    }
    else {
        studentName = e.target.querySelector(".student-name").innerText;
    }

    if (!studentName) {
        console.debug("No student name", e);
        contextMenuOpen = false;
        return;
    }

    // set event listeners
    let firstRowCb = containerNode.querySelector("#first-row");
    firstRowCb.addEventListener("change", (e) => {
        toggleFirstRow(studentName);
    })
    firstRowCb.checked = firstRowRule.includes(studentName);

    let notLastRowCb = containerNode.querySelector("#not-last-row");
    notLastRowCb.addEventListener("change", (e) => {
        toggleNotLastRow(studentName);
    })
    notLastRowCb.checked = notLastRowRule.includes(studentName);

    let btnRules = containerNode.querySelector("#btn-sitrules");
    btnRules.addEventListener("click", (e) => {
        closeContextMenu();
        sittingRulesDialogOpen();
    });

    document.body.appendChild(menu);
    containerNode.style.left = e.clientX + "px";
    containerNode.style.top = e.clientY + "px";
}

function closeContextMenu(e) {
    if (!contextMenuOpen) {
        return;
    }
    let currentMenu = document.getElementById("student-contextmenu");
    currentMenu.parentNode.removeChild(currentMenu);
    contextMenuOpen = false;
}

function studentContextmenu(e) {
    e.preventDefault();
    e.stopPropagation();
    if (contextMenuOpen) {
        closeContextMenu(e);
    }
    openContextMenu(e);
}


function sittingRulesDialogOpen() {
    let dialogFrag = template_sittingRulesDialog.content.cloneNode(true);
    let dialogNode = dialogFrag.querySelector("dialog");
    dialogNode.onclose = (e) => {
        document.body.removeChild(dialogNode);
    };

    // build actual content
    let studentFrontLs = dialogNode.querySelector("#students-sitting-in-front");
    firstRowRule.forEach(name => {
        addSingleStudentToRuleList(name, studentFrontLs, firstRowRule);
    });

    let studentNotLastRowLs = dialogNode.querySelector("#students-not-sitting-in-back");
    notLastRowRule.forEach(name => {
        addSingleStudentToRuleList(name, studentNotLastRowLs, notLastRowRule);
    })

    let ffront = dialogNode.querySelector("#add-student-front");
    ffront.addEventListener("submit", (e) => {
        e.preventDefault();
        let i = ffront.querySelector("input[name='student-name']");
        if (!globalStudents.includes(i.value) || firstRowRule.includes(i.value)) {
            return;
        }
        firstRowRule.push(i.value);
        addSingleStudentToRuleList(i.value, studentFrontLs, firstRowRule);
        updateRulesToStorage();
    })

    let fnotBack = dialogNode.querySelector("#add-student-not-in-back");
    fnotBack.addEventListener("submit", (e) => {
        e.preventDefault();
        let i = fnotBack.querySelector("input[name='student-name']");
        if (!globalStudents.includes(i.value) || notLastRowRule.includes(i.value)) {
            return;
        }
        notLastRowRule.push(i.value);
        addSingleStudentToRuleList(i.value, studentNotLastRowLs, notLastRowRule);
        updateRulesToStorage();
    })

    document.body.appendChild(dialogFrag);
    dialogNode.showModal();

    buildDialogDataLists();
}

function addSingleStudentToRuleList(name, list, arr) {
    let li = template_ruleSingleStudent.content.cloneNode(true);
    li.querySelector(".student-name").innerText = name;
    li.querySelector(".delete-button").addEventListener("click", (e) => {
        let children = list.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].querySelector(".student-name").innerText === name) {
                list.removeChild(children[i]);
                if (arr.indexOf(name) !== -1) {
                    arr.splice(arr.indexOf(name), 1);
                }
                updateRulesToStorage();
                return;
            }
        }
    });
    list.appendChild(li);
}

function addStudentCombo(listId) {
    let lst = document.getElementById(listId);
    let frag = template_studentCombinationItem.content.cloneNode(true);
    let [s1, s2] = frag.querySelectorAll("input");
    let [d1, d2] = frag.querySelectorAll("datalist");
    
    let lid1 = "dl-combo-" + listId + lst.children.length + "1";
    let lid2 = "dl-combo-" + listId + lst.children.length + "2";

    d1.id = lid1;
    d2.id = lid2;

    s1.setAttribute("list", lid1);
    s1.dataset.oldvalue = "";

    s2.setAttribute("list", lid2);
    s2.dataset.oldvalue = "";

    globalStudents.forEach(name => {
        let opt1 = document.createElement("option");
        let opt2 = document.createElement("option");

        opt1.value = name;
        opt1.innerText = name;
        opt2.value = name;
        opt2.innerText = name;

        d1.appendChild(opt1);
        d2.appendChild(opt2);
    });

    s1.addEventListener("change", (e) => {
        let n1 = s1.value;
        let oldn1 = s1.dataset.oldvalue;
        let n2 = s2.value;
        removeComboObject(oldn1, n2, lst.dataset.object === "sitWith" ? sitWithRule : forbiddenNeighboursRule);
        if (globalStudents.includes(n1) && n2) {
            addComboObject(n1, n2, lst.dataset.object === "sitWith" ? sitWithRule : forbiddenNeighboursRule);
        }
        s1.dataset.oldvalue = n1;
        updateRulesToStorage();
    });

    s2.addEventListener("change", (e) => {
        let n1 = s1.value;
        let n2 = s2.value;
        let oldn2 = s2.dataset.oldvalue;
        removeComboObject(n1, oldn2, lst.dataset.object === "sitWith" ? sitWithRule : forbiddenNeighboursRule);
        if (globalStudents.includes(n2) && n1) {
            addComboObject(n1, n2, lst.dataset.object === "sitWith" ? sitWithRule : forbiddenNeighboursRule);
        }
        s2.dataset.oldvalue = n2;
        updateRulesToStorage();
    });

    let li = frag.querySelector("li");
    frag.querySelector(".delete-button").addEventListener("click", (e) => {
        removeComboObject(s1.value, s2.value, lst.dataset.object === "sitWith" ? sitWithRule : forbiddenNeighboursRule);
        lst.removeChild(li);
    });

    lst.appendChild(frag);
}

function removeComboObject(name1, name2, obj) {
    console.debug(name1, name2, obj);
    if (obj[name1] && obj[name1].includes(name2)) {
        obj[name1].splice(obj[name1].indexOf(name2), 1);
        console.log("Deleted by name1");
    }
    if (obj[name2] && obj[name2].includes(name1)) {
        obj[name2].splice(obj[name2].indexOf(name1), 1);
        console.log("Deleted by name2");
    }
    console.debug(name1, name2, obj);
}

function addComboObject(name1, name2, obj) {
    if (name1 === name2) {
        return;
    }
    if (obj[name1] === undefined) {
        obj[name1] = [];
    }
    obj[name1].push(name2);
    
    if (obj[name2] === undefined) {
        obj[name2] = [];
    }
    obj[name2].push(name1);
}

function loadRules(rules) {
    sitWithRule = rules.sitWith ?? [];
    forbiddenNeighboursRule = rules.forbiddenNeighbours ?? [];
    firstRowRule = rules.firstRow ?? [];
    notLastRowRule = rules.notLastRow ?? [];
}

window.addEventListener("keydown", (e) => {
    if (contextMenuOpen && e.key === "Escape") {
        e.preventDefault();
        closeContextMenu(e);
    }
})

window.addEventListener("click", (e) => {
    if (contextMenuOpen) {
        let menu = document.querySelector("#student-contextmenu");
        let clientRect = menu.getBoundingClientRect();
        if (clientRect.left > e.x || clientRect.right < e.x || clientRect.top > e.y || clientRect.bottom < e.y ) {
            menu.parentNode.removeChild(menu);
            contextMenuOpen = false;
        }
    }
});

window.addEventListener("contextmenu", (e) => {
    closeContextMenu(e);
});

window.addEventListener("DOMContentLoaded", (e) => {
    template_studentListContextMenu = document.getElementById("templ-student-contextmenu");
    template_sittingRulesDialog = document.getElementById("templ-rules-dialog");
    template_ruleSingleStudent = document.getElementById("templ-single-student-sit-rule-item");
    template_studentCombinationItem = document.getElementById("templ-student-combination-item");

    loadRules(loadFromStorage(KEY_RULES, {
        sitWith: [],
        forbiddenNeighbours: [],
        firstRow: [],
        notLastRow: []
    }));
})