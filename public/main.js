import './editor.js';
import './wheel.js';

window.globalState = window.globalState || {
    "items": [
        {
            "text": "꽣",
            "factor": "30",
            "color": 1
        },
        {
            "text": "Climb Something",
            "factor": "5",
            "color": 200
        },
        {
            "text": "Burrito Dance",
            "factor": "1",
            "color": 32
        },
        {
            "text": "Write on face",
            "factor": "0.001",
            "color": 250
        },
        {
            "text": "Uncap Subathon",
            "factor": "0.999",
            "color": 94.88684716936274
        },
        {
            "text": "Squat 10",
            "factor": "7",
            "color": 65.52955975807731
        },
        {
            "text": "Hand Stand",
            "factor": "1",
            "color": 154.7613854667044
        },
        {
            "text": "Freeze for 3min",
            "factor": "10",
            "color": 38.7631787661107
        },
        {
            "text": "Wear Glasses 3min",
            "factor": "10",
            "color": 137.44811559684288
        },
        {
            "text": "Mute mic 3min",
            "factor": "10",
            "color": 124.2468828976131
        },
        {
            "text": "Sing a song",
            "factor": "5",
            "color": 142.10360389302048
        },
        {
            "text": "Roll 5 times",
            "factor": "10",
            "color": 98.68443065133833
        },
        {
            "text": "Speak Korean 3min",
            "factor": "5",
            "color": 138.9672800088222
        },
        {
            "text": "Emote only 3min",
            "factor": "5",
            "color": 198.97301520521808
        }
    ]
}

window.addEventListener('DOMContentLoaded', () => {
    const wheel = document.querySelector('gamble-wheel');
    const drawerHandle = document.querySelector('.drawer-handle');

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
