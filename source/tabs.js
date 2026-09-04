class ComTabs extends HTMLElement {
  static observedAttributes = ["orientation"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
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
          padding: 7px 10px;
          border: 0;
          background: transparent;
          text-align: center;
          border-radius: 7px;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          color: #888;
          transition:
            background .2s,
            color .2s,
            box-shadow .2s;
          font-weight: 600;
          white-space: nowrap;
        }

        .tab:hover {
          color: #333;
        }

        .tab:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        .tab[aria-selected="true"] {
          background: #fff;
          color: #000;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        /*
         * 縦型
         */
        :host([orientation="vertical"]) #tabs {
          flex-direction: column;
          overflow-x: visible;
          overflow-y: auto;
          width: max-content;
          min-width: 120px;
          margin-bottom: 0;
        }

        :host([orientation="vertical"]) .tab {
          flex: none;
          width: 100%;
        }

        :host([orientation="vertical"]) {
          display: flex;
          gap: 16px;
        }

        :host([orientation="vertical"]) ::slotted(*) {
          flex: 1;
          min-width: 0;
        }
      </style>

      <div
        id="tabs"
        role="tablist"
        aria-label="タブ"
      ></div>

      <slot></slot>
    `;

    this.#init();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "orientation" && oldValue !== newValue && this.shadowRoot) {
      this.#updateOrientation();
    }
  }

  #init() {
    const slot = this.shadowRoot.querySelector("slot");
    const tabsEl = this.shadowRoot.querySelector("#tabs");

    this.#slot = slot;
    this.#tabsEl = tabsEl;

    slot.addEventListener("slotchange", () => this.#update());

    tabsEl.addEventListener("keydown", e => {
      this.#handleKeydown(e);
    });

    this.#update();
  }

  #update() {
    const pages = this.#slot.assignedElements();

    this.#tabsEl.replaceChildren();

    pages.forEach((page, i) => {
      const tabId = this.#getTabId(i);
      const panelId = this.#getPanelId(i);

      const button = document.createElement("button");

      button.className = "tab";
      button.type = "button";
      button.id = tabId;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", i === 0 ? "true" : "false");
      button.setAttribute("aria-controls", panelId);
      button.tabIndex = i === 0 ? 0 : -1;

      button.textContent =
        page.getAttribute("label") || `Tab ${i + 1}`;

      page.id = panelId;
      page.setAttribute("role", "tabpanel");
      page.setAttribute("aria-labelledby", tabId);
      page.tabIndex = 0;
      page.hidden = i !== 0;

      button.addEventListener("click", () => {
        this.#select(i);
      });

      this.#tabsEl.appendChild(button);
    });

    this.#updateOrientation();
  }

  #select(index, focus = false) {
    const pages = this.#slot.assignedElements();
    const tabs = [...this.#tabsEl.querySelectorAll('[role="tab"]')];

    if (!pages[index] || !tabs[index]) return;

    pages.forEach((page, i) => {
      const active = i === index;

      page.hidden = !active;
      tabs[i].setAttribute("aria-selected", String(active));
      tabs[i].tabIndex = active ? 0 : -1;
    });

    if (focus) {
      tabs[index].focus();
    }
  }

  #handleKeydown(e) {
    const tabs = [...this.#tabsEl.querySelectorAll('[role="tab"]')];

    const current = tabs.indexOf(document.activeElement);

    if (current === -1) return;

    const vertical = this.getAttribute("orientation") === "vertical";

    let next = current;

    if (vertical) {
      if (e.key === "ArrowDown") {
        next = current + 1;
      } else if (e.key === "ArrowUp") {
        next = current - 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = tabs.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        this.#select(current);
        e.preventDefault();
        return;
      } else {
        return;
      }
    } else {
      if (e.key === "ArrowRight") {
        next = current + 1;
      } else if (e.key === "ArrowLeft") {
        next = current - 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = tabs.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        this.#select(current);
        e.preventDefault();
        return;
      } else {
        return;
      }
    }

    e.preventDefault();

    next = (next + tabs.length) % tabs.length;

    this.#select(next, true);
  }

  #updateOrientation() {
    const vertical = this.getAttribute("orientation") === "vertical";

    this.#tabsEl.setAttribute(
      "aria-orientation",
      vertical ? "vertical" : "horizontal"
    );
  }

  #getTabId(index) {
    return `${this.id || "com-tabs"}-tab-${index}`;
  }

  #getPanelId(index) {
    return `${this.id || "com-tabs"}-panel-${index}`;
  }
}

customElements.define("com-tabs", ComTabs);
