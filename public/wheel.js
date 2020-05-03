import { html, render } from 'https://unpkg.com/lit-html?module';

const image = new Image();
image.src = "./logo.png";

function generateWheelImage(names = []) {

    const width = 600;
    const height = 600;

    const radius = 250;
    const centerRadius = 30;
    const wheelBorder = 3.5;
    const lineWidth = 3.5;

    const textOffset = 10;
    
    const textColor = "#eee";
    const borderColor = "white";

    const backgroundColor = "white";
    const centerColor = "white";

    const font = "16px Roboto, Arial";

    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    const center = [width / 2, height / 2];

    context.font = font;
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
        context.fillStyle = `hsl(${item.color}, 50%, 50%)`;
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

    if(image.complete) {
        context.drawImage(image, center[0] - (75 / 2), center[1] - (75 / 2), 75, 75);
    } else {
        image.onload = () => {
            context.drawImage(image, center[0] - (75 / 2), center[1] - (75 / 2), 75, 75);
        }
    }

    return canvas;
}

function turnWheel(wheel, itemsState, updateCallback = () => {}) {

    const startTime = Date.now();
    const tickrate = 1000 / 144;

    // 3.6 = one rotation
    const minVelocity = 3.6 * 2;
    const drag = 0.0065;

    const state = {
        angle: 0,
        velocity: Math.random() * 36 + minVelocity,
        target: itemsState.items[0],
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

        lastFrame = currentFrame;

        draw();

        if(state.velocity > 0.01) {
            requestAnimationFrame(animate);
        } else {
            state.winner = state.target;
            updateCallback(state);
            console.log('time', Date.now() - startTime);
        }
    }

    const update = () => {
        state.angle += state.velocity;
        state.velocity *= 1 - drag;

        const items = itemsState.items;

        const wheelFraction = state.angle / 360;
        const itemFraction = (wheelFraction * 100) % 100; // 0 - 100

        let target;
        let factorSum = 0;

        for(let item of itemsState.items) {
            if(factorSum <= itemFraction) {
                factorSum += +item.factor;
                target = item;
            }
        }

        if(state.target != target) {
            state.target = target;

            updateCallback(state);
        }
    }

    const draw = () => {
        if(wheel) {
            wheel.style.transform = `rotate(${state.angle - 89.5}deg)`;
        }
    }

    animate();
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
            this.setWheel();
        });

        window.addEventListener('state.load', () => {
            this.setWheel();
        });
    }

    setWheel() {
        this.wheel = generateWheelImage(globalState.items);

        const wheel = this.shadowRoot.querySelector('.wheel');

        wheel.addEventListener('click', () => {
            if(!this.turning) {
                this.turning = true;

                turnWheel(this.wheel, globalState, (state) => {
            
                    if(state.target) {
                        this.display.innerText = state.target.text;
                    }
        
                    if(state.winner) {
                        this.turning = false;
                        console.log('winner', state.winner);
                        this.showWinner(state.winner);

                        this.dispatchEvent(new WheelWinnerEvent(state.winner));
                    }
                });
            }
        });

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
                    background: #434343;
                    border-radius: 6px;
                    white-space: nowrap;
                    text-align: center;
                }
                .wheel {
                    position: relative;
                    z-index: 100;
                    overflow: hidden;
                }
                .wheel::after {
                    content: "";
                    position: absolute;
                    z-index: 1000;
                    left: 50%;
                    top: 30px;
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
