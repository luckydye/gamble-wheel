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

async function fetchAllEmotes() {
    const url = `https://api.frankerfacez.com/v1/room/lirik`;
    const json = await fetch(url).then(res => res.json());

    const emoteAsImages = [];

    const emoticons = json.sets[Object.keys(json.sets)[0]].emoticons;

    for(let emote of emoticons) {
        const img = new Image();
        img.onload = () => {
            emoteAsImages.push(img);
        }
        img.src = emote.urls[1];
    }

    return emoteAsImages;
}

let emotes = [];

fetchAllEmotes().then(emoteList => {
    emotes = emoteList;
});

function winnerAnimation(winner) {
    const cvs = document.querySelector('.animated-background');
    const ctx = cvs.getContext("2d");

    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    const particles = [];
    let lastTick = performance.now();
    let deltaTime = 0;

    const updateCanvas = (ms = 0) => {
        const currentTick = performance.now();
        const delta = currentTick - lastTick;
        deltaTime += delta;

        ctx.clearRect(0, 0, cvs.width, cvs.height);

        ctx.globalAlpha = 0.7;

        let alife = 0;

        for(let particle of particles) {

            ctx.save();

            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            if(particle.image) {
                const size = particle.size;
                ctx.drawImage(particle.image, -(size/2), -(size/2), size, size);
            } else {
                ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                const size = particle.size / 5;
                ctx.fillRect(-(size/2), -(size/2), size, size);
            }

            ctx.restore();

            particle.x += particle.velocity[0];
            particle.y += particle.velocity[1];
            particle.rotation += particle.velocity[2];

            if(particle.y < cvs.height + 5) {
                alife += 1;
            }

            particle.velocity[0] *= 0.995;
            particle.velocity[1] += 0.0009 * particle.size;
            particle.velocity[2] *= 0.995;
        }

        if(alife > 0) {
            requestAnimationFrame(updateCanvas);
        } else {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
        }

        lastTick = currentTick;
    }
    
    for(let i = 0; i < 500; i++) {
        const a = Math.random() * (Math.PI * 2);

        let image;
        if(winner.text.toLocaleLowerCase().match('emote') && Math.random() > 0.5) {
            image = emotes[Math.floor(Math.random() * emotes.length)]
        }

        particles.push({ 
            image: image,
            x: cvs.width / 2,
            y: cvs.height / 2, 
            rotation: Math.random() * (Math.PI * 2),
            size: Math.random() * 20 + 20,
            velocity: [
                Math.sin(a) * (Math.random() * 7),
                Math.cos(a) * (Math.random() * 3) - 4,
                Math.random() * 0.01 + 0.05,
            ]
        });
    }
    updateCanvas();
}

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
        winnerAnimation(e.winner);
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
