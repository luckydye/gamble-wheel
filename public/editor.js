import {html, render} from 'https://unpkg.com/lit-html?module';
import './FluidInput.js';

class ItemsEditor extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        window.addEventListener('state.load', () => {
            this.render();
        });
    }

    connectedCallback() {
        if(window.globalState) {
            this.render();
        }
    }

    getFactorSum() {
        return globalState.items.reduce((accumulator, item) => {
            const factor = +item.factor;
            return accumulator + factor;
        }, 0);
    }

    template() {
        const items = globalState.items;
        const self = this;

        return html`
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <style>
                :host {
                    padding: 20px;
                    background: #434343;
                    border-radius: 6px;
                    display: block;
                    color: white;
                    box-shadow: 1px 2px 12px rgba(0, 0, 0, 0.4);
                }
                
                ::-webkit-scrollbar {
                    width: 10px;
                    margin: 0 4px;
                    margin-left: 2px;
                }
                ::-webkit-scrollbar-button {
                    display: none;
                }
                ::-webkit-scrollbar-track-piece  {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #333333;
                    border-radius: 5px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #4e4e4e;
                }
                ::-webkit-scrollbar-corner {
                    background: transparent;
                }

                h3 {
                    margin: 0;
                    text-transform: uppercase;
                    font-weight: 300;
                }

                .items-list {
                    height: 450px;
                    width: 340px;
                    overflow: auto;
                    padding: 0 10px 0 0;
                    margin-right: -10px;
                }

                input {
                    border: none;
                    outline: none;
                    color: white;
                    padding: 8px 10px;
                    font-size: 16px;
                    background: #353535;
                    border-radius: 4px;
                    width: auto;
                }

                input:focus {
                    background: #393939;
                }

                .name-input {
                    width: 100%;
                    margin-right: 5px;
                }

                .factor-input {
                    --color-input-background: #353535;
                    --color-input-hover-background: #393939;
                    --color-input-active-background: #2f2f2f;
                    height: 34px;
                    min-width: 90px;
                    margin-right: 5px;
                    text-align: center;
                }

                .item {
                    display: flex;
                    margin-bottom: 3px;
                    overflow: hidden;
                    justify-content: space-between;
                    align-items: center;
                }

                .header {
                    margin-bottom: 15px;
                }

                button {
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #353535;
                    border-radius: 4px;
                    cursor: pointer;
                    height: 34px;
                    width: 40px;
                    border: none;
                    outline: none;
                }

                button:hover {
                    background: #393939;
                }

                button:active {
                    background: #2f2f2f;
                }

                .del-btn {
                    width: 50px;
                }

                .add-btn {
                    margin: 10px 0;
                    width: 100%;
                }

                .item.sum {
                    padding: 10px 60px 10px 10px;
                    margin: 0;
                }

                .item.sum a {
                    opacity: 0.5;
                    font-weight: 300;
                }

                .material-icons {
                    font-size: 18px;
                    color: #eee;
                }
            </style>
            <div class="item header">
                <h3>Fields (${globalState.items.length})</h3>
            </div>
            <div class="items-list">
                ${items.map(item => {
                    return html`
                        <div class="item">
                            <input title="Title" class="name-input" value="${item.text}" @input="${function(e) {
                                item.text = this.value;
                                saveState();
                                self.render();
                            }}"/>
                            <gyro-fluid-input 
                                title="Probability" 
                                class="factor-input" 
                                min="0" max="100" 
                                suffix="%" 
                                value="${item.factor}" 
                                steps="0.001" 
                                @change="${function(e) {
                                    if(self.getFactorSum() > 100) {
                                        item.factor = this.value - (self.getFactorSum() - 100);
                                        this.setValue(item.factor);
                                    } else {
                                        item.factor = this.value;
                                        saveState();
                                        self.render();
                                    }}}">
                            </gyro-fluid-input>
                            <button class="del-btn" @click="${() => {
                                const index = globalState.items.indexOf(item);
                                globalState.items.splice(index, 1);
                                saveState();
                                this.render();
                            }}">
                                <span class="material-icons" title="Delete">delete_outline</span>
                            </button>
                        </div>
                    `;
                })}
            </div>
            <div class="item sum">
                <a>Probability sum:</a>
                <span data="${globalState.items.length}">
                    ${this.getFactorSum().toFixed(2)}%
                </span>
            </div>
            <div class="item">
                <button class="add-btn" @click="${() => {
                    if(globalState.items.length > 200) {
                        return;
                    }

                    globalState.items.push({ text: "Empty", factor: 0, color: Math.random() * 255 });
                    saveState();
                    this.render();

                    const listElem = this.shadowRoot.querySelector('.items-list');
                    listElem.scrollTo(0, listElem.scrollHeight);
                }}">
                    <span class="material-icons">add</span>
                </button>
            </div>
        `;
    }

    render() {
        render(this.template(), this.shadowRoot);
    }

}

customElements.define('item-editor', ItemsEditor);
