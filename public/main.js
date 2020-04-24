import './editor.js';
import './wheel.js';

window.globalState = {
    repeat: 1,
    items: [
        { text: "Option 1", color: 1 },
        { text: "Option 2", color: 200 },
        { text: "Option 3", color: 32 },
        { text: "Option 4", color: 250 },
    ]
}

window.addEventListener('DOMContentLoaded', () => {
    const drawerHandle = document.querySelector('.drawer-handle');
    drawerHandle.addEventListener('click', () => {
        const drawer = drawerHandle.parentNode;
        if(drawer.hasAttribute('open')) {
            drawer.removeAttribute('open');
        } else {
            drawer.setAttribute('open', '');
        }
    });
})

window.loadSave = function loadSave() {
    const state = localStorage.getItem('wheel-state');
    if(state) {
        globalState = JSON.parse(state);
        console.log('state loaded');
    }
    window.dispatchEvent(new Event('state.load'));
    return globalState;
}

window.saveState = function saveState() {
    localStorage.setItem('wheel-state', JSON.stringify(globalState));
    console.log('state saved');
    window.dispatchEvent(new Event('state.save'));
    return true;
}

loadSave();
