import { html, render } from 'https://unpkg.com/lit-html?module';

const image = new Image();
image.src = "./logo.png";

function generateWheelImage(names = []) {

    const width = 650;
    const height = 650;

    const wheelBorder = 0;
    const centerImageBorder = 5;
    const radius = (width / 2) - wheelBorder;
    const centerRadius = radius / 100 * 20;
    const lineWidth = 1.5;

    const textOffset = 10;
    
    const textColor = "#eee";
    const borderColor = "white";

    const backgroundColor = "white";
    const centerColor = "white";

    const fontSize = 16;
    const font = "Roboto, Arial";

    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    const center = [width / 2, height / 2];

    context.textBaseline = "middle";
    context.textAlign = "right";

    // background
    context.fillStyle = backgroundColor;
    context.arc(center[0], center[1], radius + wheelBorder, 0, Math.PI * 2);
    context.fill();

    // sections
    names = [...names].reverse();
    const sectionsCount = names.length;
    const steps = (Math.PI * 2) / sectionsCount;

    let angleOffset = 0;

    for(let i = 0; i < sectionsCount; i++) {
        const item = names[i % names.length];

        const angel = (Math.PI * 2) * (item.factor / 100);
        let a = angleOffset + angel;
        
        context.strokeStyle = borderColor;
        context.fillStyle = `hsl(${item.color}, 60%, 55%)`;
        context.lineWidth = lineWidth;

        context.beginPath();

        context.moveTo(
            center[0], 
            center[1]
        );
        context.arc(
            center[0], 
            center[1], 
            radius, 
            angleOffset, a
        );
        context.lineTo(
            center[0], 
            center[1]
        );

        context.stroke();
        context.fill();

        const fieldSize = Math.min(a - angleOffset, 0.3) + 0.7;

        context.font = `${fontSize * fieldSize}px ${font}`;

        const textAngle = angleOffset + angel - (angel / 2);

        context.translate(
            center[0] + Math.cos(textAngle) * radius, 
            center[1] + Math.sin(textAngle) * radius
        );
        context.rotate(textAngle);

        context.fillStyle = textColor;

        let formatedText = item.text.substring(0, 18);
        if(item.text.length > formatedText.length) {
            formatedText += "...";
        }
        context.fillText(formatedText, -textOffset, 0);
        
        context.resetTransform();
        
        angleOffset += angel;
    }

    context.beginPath();

    let centerImageSize = centerRadius * 2;

    const drawimage = () => {

        const x = center[0] - (centerImageSize / 2);
        const y = center[1] - (centerImageSize / 2);

        context.fillStyle = backgroundColor;
        context.arc(center[0], center[1], centerImageSize / 2 + centerImageBorder, 0, Math.PI * 2);
        context.fill();
        context.drawImage(image, x, y, centerImageSize, centerImageSize);
    }

    if(image.complete) {
        drawimage();
    } else {
        image.onload = () => {
            drawimage();
        }
    }

    return canvas;
}

class WheelWinnerEvent extends Event {
    constructor(winner) {
        super('finished');
        this.winner = winner;
    }
}

class GambleWheel extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.display = document.createElement('span');
        this.display.innerText = "-";

        this.turning = false;

        window.addEventListener('state.save', () => {
            this.resetWheel();
        });

        window.addEventListener('state.load', () => {
            this.resetWheel();
        });
    }

    draw(state) {
        if(this.wheel) {
            this.wheel.style.transform = `rotate(${state.angle - 90.125}deg)`;
        }
    }

    update(state) {
        if(state.target) {
            this.display.innerText = state.target.text;
        }

        if(state.winner) {
            this.turning = false;
            console.log('winner', state.winner);
            this.showWinner(state.winner);

            this.dispatchEvent(new WheelWinnerEvent(state.winner));
        }
    }

    turnWheel(itemSet) {
        this.setAttribute('turning', '');

        return new Promise((resolve, reject) => {
    
            const startTime = Date.now();
            const tickrate = 1000 / 144;
    
            // 3.6 = one rotation
            const drag = 0.9935;
            const minVelocity = (1.35 + drag) * 3;
    
            const state = {
                angle: 0,
                velocity: Math.random() * 36 + minVelocity,
                target: itemSet[0],
                winner: null,
            }
    
            console.log('energy:', state.velocity);
    
            let lastFrame, accumulator = 0;
    
            const animate = () => {
                
                const currentFrame = performance.now();
    
                if(lastFrame) {
                    let delta = currentFrame - lastFrame;
    
                    if(accumulator == 0) {
                        delta = tickrate;
                    }
                    
                    accumulator += delta;
                    
                    while (accumulator > tickrate) {
                        accumulator -= tickrate;
                        update();
                    }
                }
    
                this.draw(state);
    
                lastFrame = currentFrame;
    
                if(state.velocity > 0.01) {
                    requestAnimationFrame(animate);
                } else {
                    state.winner = state.target;
                    this.update(state);
                    console.log('time', Date.now() - startTime);
                    resolve(state);
                }
            }
    
            const update = () => {
                state.angle += state.velocity;
                state.velocity *= drag;
    
                const items = itemSet;
    
                const wheelFraction = state.angle / 360;
                const itemFraction = (wheelFraction * 100) % 100; // 0 - 100
    
                let target;
                let factorSum = 0;
    
                for(let item of itemSet) {
                    if(factorSum <= itemFraction) {
                        factorSum += +item.factor;
                        target = item;
                    }
                }
    
                if(state.target != target) {
                    state.target = target;
    
                    this.update(state);
                }
            }
    
            animate();
        })
    }

    resetWheel() {
        this.wheel = generateWheelImage(globalState[window.wheelSet]);

        const wheel = this.shadowRoot.querySelector('.wheel');

        wheel.onclick = () => {
            if(!this.turning) {
                this.turning = true;
                this.turnWheel(globalState[window.wheelSet]);
            }
        };

        this.render();
    }

    connectedCallback() {
        this.render();
    }

    showWinner(winner) {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = "prompt";
        render(html`
            <button @click="${() => {
                winnerDiv.remove();
            }}">X</button>
            <div>
                <div class="label">Winner:</div>
                <div class="text">${winner.text}</div>
            </div>
        `, winnerDiv);

        document.body.appendChild(winnerDiv);
    }

    template() {
        return html`
            <style>
                :host {
                    text-align: center;
                    color: #eee;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .display {
                    font-size: 24px;
                    min-width: 300px;
                    padding: 0 10px;
                    line-height: 40px;
                    /* background: #434343; */
                    border-radius: 6px;
                    white-space: nowrap;
                    text-align: center;
                    margin-bottom: 20px;
                    z-index: 1000;
                    position: relative;
                }
                .wheel {
                    position: relative;
                    z-index: 10;
                }
                .wheel::after {
                    content: "";
                    position: absolute;
                    z-index: 1000;
                    left: 50%;
                    top: -10px;
                    height: 30px;
                    width: 4px;
                    background: white;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
                    transform: translate(-50%, 0);
                }
                .wheel:active {
                    transform: scale(0.995);
                }
                a {
                    opacity: 0.5;
                }
                canvas {
                    position: relative;
                    z-index: -1;
                    width: 100%;
                    border-radius: 50%;
                    box-shadow: 0 2px 18px rgba(0, 0, 0, 0.5);
                    
                }

                :host(:not([turning])) canvas {
                    animation: 60s idle linear;
                    animation-iteration-count: infinite;
                }

                @keyframes idle {
                    from { transform: rotate(0); }
                    to { transform: rotate(-360deg); }
                }
            </style>
            <div class="display">
                ${this.display}
            </div>
            <div class="wheel">
                ${this.wheel}
            </div>
        `;
    }

    render() {
        render(this.template(), this.shadowRoot);
    }

}

customElements.define('gamble-wheel', GambleWheel);
