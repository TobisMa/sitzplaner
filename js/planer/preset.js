const presets = {
    empty: {
        room: {}
    },
    "frontal": {
        width: 9,
        height: 7,
        room: {
            "0,0": "",
            "1,0": "",
            "2,0": "",
            "3,0": "",
            "0,2": "",
            "1,2": "",
            "2,2": "",
            "3,2": "",
            "3,4": "",
            "2,4": "",
            "1,4": "",
            "0,4": "",
            "0,6": "",
            "1,6": "",
            "2,6": "",
            "3,6": "",
            "5,0": "",
            "6,0": "",
            "6,2": "",
            "5,2": "",
            "5,4": "",
            "6,4": "",
            "6,6": "",
            "5,6": "",
            "7,0": "",
            "8,0": "",
            "7,2": "",
            "8,2": "",
            "8,4": "",
            "7,4": "",
            "7,6": "",
            "8,6": ""
        }
    },
    "u-form": {
        width: 9,
        height: 7,
        room: {
            "0,0": "",
            "0,1": "",
            "0,2": "",
            "0,3": "",
            "0,4": "",
            "0,5": "",
            "0,6": "",
            "1,0": "",
            "1,4": "",
            "1,6": "",
            "1,2": "",
            "2,0": "",
            "2,2": "",
            "2,4": "",
            "2,6": "",
            "6,6": "",
            "7,6": "",
            "8,6": "",
            "8,4": "",
            "7,4": "",
            "6,4": "",
            "6,2": "",
            "7,2": "",
            "8,2": "",
            "8,0": "",
            "7,0": "",
            "6,0": "",
            "8,1": "",
            "8,3": "",
            "8,5":""
        },
    },
    "groups": {
        width: 8,
        height: 8,
        room: {
            "0,0": "",
            "0,2": "",
            "0,1": "",
            "1,2": "",
            "1,1": "",
            "1,0": "",
            "0,5": "",
            "1,5": "",
            "1,6": "",
            "1,7": "",
            "0,7": "",
            "0,6": "",
            "3,2": "",
            "3,0": "",
            "3,1": "",
            "4,0": "",
            "4,1": "",
            "4,2": "",
            "6,2": "",
            "6,1": "",
            "6,0": "",
            "7,0": "",
            "7,1": "",
            "7,2": "",
            "6,5": "",
            "7,5": "",
            "7,6": "",
            "7,7": "",
            "6,7": "",
            "6,6":""
        }
    }
}


function emptyPlan(event) {
    let answer = window.confirm("Dies wird alle Tische entfernen und Schüler zurück in die Seitenleiste bewegen");
    if (!answer) return;
    loadTablePreset("empty");
}


function loadTablePreset(name) {
    if (!presets[name]) {
        console.debug("Preset name not found:", name);
        return;
    }
    let p = JSON.parse(JSON.stringify(presets[name]));
    loadRoom(p.room, p.width ?? roomWidth, p.height ?? roomHeight, false);
}


window.addEventListener("DOMContentLoaded", (e) => {
    document.querySelectorAll("#presets .preset").forEach(container => {
        if (container.dataset.presetname === "reset") {
            container.addEventListener("click", e => {
                let answer = confirm("Alle Schüler aus den Tischen entfernen?");
                if (!answer) {
                    return;
                }
                let newRoom = {};
                for (const key of Object.keys(roomStudents)) {
                    newRoom[key] = "";
                }
                loadRoom(newRoom, roomWidth, roomHeight);
            });
            return;
        }
        container.addEventListener("click", (e) => {
            if (container.classList.contains("reset")) {
                if (!confirm(container.dataset.resetmsg || "Sind sie sicher, dass sie diese Aktion durchführen wollen?")) {
                    return;
                }
            }
            loadTablePreset(e.target.dataset.presetname);
        });
    });
});
