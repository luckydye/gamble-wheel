import {html, render} from 'https://unpkg.com/lit-html?module';

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

    template() {
        const items = globalState.items;
        const self = this;

        return html`
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
                    font-weight: 400;
                }

                .items-list {
                    height: 450px;
                    width: 320px;
                    overflow: auto;
                    padding: 0 10px 0 0;
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
                    margin-right: 10px;
                }

                .factor-input {
                    width: 50px;
                    margin-right: 5px;
                    text-align: center;
                }

                .factor-input-sufix {
                    margin-right: 10px;
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
                    padding: 10px;
                    margin: 0;
                }
            </style>
            <div class="item header">
                <h3>Wheel Set</h3>
            </div>
            <div class="items-list">
                ${items.map(item => {
                    return html`
                        <div class="item">
                            <input class="name-input" value="${item.text}" @input="${function(e) {
                                item.text = this.value;
                                saveState();
                                self.render();
                            }}"/>
                            <input class="factor-input" value="${item.factor}" @input="${function(e) {
                                item.factor = this.value;
                                saveState();
                                self.render();
                            }}"/><span class="factor-input-sufix">%</span>
                            <button class="del-btn" @click="${() => {
                                const index = globalState.items.indexOf(item);
                                globalState.items.splice(index, 1);
                                saveState();
                                this.render();
                            }}">-</button>
                        </div>
                    `;
                })}
            </div>
            <div class="item sum">
                <span>Probability sum:</span>
                <span data="${globalState.items.length}">
                    ${globalState.items.reduce((accumulator, item) => {
                        const factor = +item.factor;
                        return accumulator + factor;
                    }, 0)}%
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
                }}">+</button>
            </div>
        `;
    }

    render() {
        render(this.template(), this.shadowRoot);
    }

}

customElements.define('item-editor', ItemsEditor);
