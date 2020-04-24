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
        const repeat = globalState.repeat;
        const items = globalState.items;

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

                h3 {
                    margin: 0;
                    font-weight: 400;
                }

                .items-list {
                    height: 450px;
                    width: 320px;
                    overflow: auto;
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

                .add-btn {
                    margin: 10px 0;
                    width: 100%;
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
                            }}"/>
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
            <div class="item">
                <button class="add-btn" @click="${() => {
                    if(globalState.items.length > 200) {
                        return;
                    }

                    globalState.items.push({ text: "Empty", color: Math.random() * 255 });
                    saveState();
                    this.render();

                    const listElem = this.shadowRoot.querySelector('.items-list');
                    listElem.scrollTo(0, listElem.scrollHeight);
                }}">+</button>
            </div>
            <div class="item">
                <div>Repeat set:</div>
                <input type="number" min="1" max="10" value="${globalState.repeat}" @input="${function(e) {
                    globalState.repeat = Math.min(Math.max(this.valueAsNumber, 1), 10);
                    this.value = globalState.repeat;
                    saveState();
                }}"/>
            </div>
        `;
    }

    render() {
        render(this.template(), this.shadowRoot);
    }

}

customElements.define('item-editor', ItemsEditor);
