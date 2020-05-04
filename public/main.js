import './editor.js';
import './wheel.js';

// state mngmnt

window.globalState = window.globalState || {
    "items": [
        {
            "text": "Option 1",
            "factor": 25,
            "color": 1
        },
        {
            "text": "Option 2",
            "factor": 25,
            "color": 200
        },
        {
            "text": "Option 3",
            "factor": 25,
            "color": 32
        },
        {
            "text": "Option 4",
            "factor": 25,
            "color": 250
        }
    ]
}

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
    // console.log('state saved');
    window.dispatchEvent(new Event('state.save'));
    return true;
}

loadSave();

// main

window.addEventListener('DOMContentLoaded', () => {
    const wheel = document.querySelector('gamble-wheel');
    const drawerHandle = document.querySelector('.drawer-handle');

    wheel.addEventListener('finished', e => {
        if(e.winner.text.toLocaleLowerCase().match('roll')) {
            wheel.style.animation = "roll 1s ease";
            wheel.onanimationend = () => {
                wheel.style.animation = "";
            }
        }
    });

    drawerHandle.addEventListener('click', () => {
        if(!wheel.turning) {
            const drawer = drawerHandle.parentNode;
            if(drawer.hasAttribute('open')) {
                drawer.removeAttribute('open');
                document.body.removeAttribute('open');
            } else {
                drawer.setAttribute('open', '');
                document.body.setAttribute('open', '');
            }
        }
    });
})
