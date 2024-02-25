let touchStartTime = null;
let touchStartX = null;
let touchStartY = null;

const TOUCH_DRAG = "drag";
const TOUCH_NORMAL = "normal";
let touchSimulation = TOUCH_NORMAL;

const RIGHT_CLICK_TOUCH = 300;  // ms 
const DRAG_DISTANCE = 25;  // px²

window.addEventListener("touchstart", (e) => {
    if (e.touches.length >= 2) {
        return;
    }
    e.preventDefault();
    touchStartTime = e.timeStamp;    // timeStamp in ms
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    console.debug("Touch start:", touchStartTime);
});


window.addEventListener("touchmove", (e) => {
    if (e.touches.length >= 2) { 
        touchSimulation = TOUCH_NORMAL;
        return;
    }
    if (touchSimulation === TOUCH_NORMAL) {
        let moveX = touchStartX - e.touches[0].clientX;
        let moveY = touchStartY - e.touches[0].clientY;
        if (moveX * moveX + moveY * moveY >= DRAG_DISTANCE) {
            touchSimulation = TOUCH_DRAG;
            e.target.dispatchEvent(new Event("dragStart"));
        }
    }
});

window.addEventListener("touchend", (e) => {
    console.log("touch end diff:", e.timeStamp - touchStartTime);
    if (!touchStartTime || e.touches.length >= 2) {
        touchStartTime = null;
        return;
    }

    e.preventDefault();
    let diff = e.timeStamp - touchStartTime;  // ms 
    if (diff >= RIGHT_CLICK_TOUCH && touchSimulation === TOUCH_NORMAL && moveDistance < DRAG_DISTANCE) {
        e?.target.dispatchEvent(new Event("contextmenu"));  // event 
    }
    touchStartTime = null;
});

window.addEventListener("touchcancel", (e) => {
    console.debug("touch cancel");
    if (touchSimulation == 0) {}
    touchStartTime = null;
    touchSimulation = TOUCH_NORMAL;
});