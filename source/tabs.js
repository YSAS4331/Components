class ComTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML =
`<style>
  :host {
    display: block;
  }

  #tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    background: #f5f5f7;
    padding: 4px;
    border-radius: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  #tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    flex: 1;
    min-width: 100px;
    padding: 7px 0;
    text-align: center;
    border-radius: 7px;
    cursor: pointer;
    font-size: 11px;
    color: #888;
    transition: 0.2s;
    font-weight: 600;
    white-space: nowrap;
  }

  .tab.active {
    background: #fff;
    color: #000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
</style>
<div id="tabs"></div>
<slot></slot>`;
    
    this.#init();
  }

  #init() {
    const slot = this.shadowRoot.querySelector("slot");
    const tabsEl = this.shadowRoot.querySelector("#tabs");

    const update = () => {
      const pages = slot.assignedElements();
      const frag = document.createDocumentFragment();

      pages.forEach((page, i) => {
        const btn = document.createElement("div");
        btn.className = "tab";
        btn.textContent = page.getAttribute("label") || `Tab ${i + 1}`;
        btn.addEventListener("click", () => this.#select(i));
        frag.appendChild(btn);

        page.style.display = "none";
      });

      tabsEl.innerHTML = "";
      tabsEl.appendChild(frag);

      this.#select(0);
    };

    slot.addEventListener("slotchange", update);
    update();
  }

  #select(index) {
    const pages = this.shadowRoot.querySelector("slot").assignedElements();
    const tabs = this.shadowRoot.querySelectorAll(".tab");

    pages.forEach((p, i) => {
      p.style.display = i === index ? "block" : "none";
    });

    tabs.forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });
  }
}

customElements.define("com-tabs", ComTabs);
