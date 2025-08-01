export default class PrintButton extends HTMLElement {
    buttonTemplate() {
        const svgStyles = `width: 1em; height: 1em;`;

        const svg = `
            <svg style="${svgStyles}" viewBox="0 0 512 512" stroke="currentColor" fill="currentColor" stroke-width="0" aria-hidden="true">
                <path d="M400 96V56a8 8 0 0 0-8-8H120a8 8 0 0 0-8 8v40"></path><rect width="208" height="160" x="152" y="264" fill="none" rx="4" ry="4"></rect><path d="M408 112H104a56 56 0 0 0-56 56v208a8 8 0 0 0 8 8h56v72a8 8 0 0 0 8 8h272a8 8 0 0 0 8-8v-72h56a8 8 0 0 0 8-8V168a56 56 0 0 0-56-56zm-48 308a4 4 0 0 1-4 4H156a4 4 0 0 1-4-4V268a4 4 0 0 1 4-4h200a4 4 0 0 1 4 4zm34-212.08a24 24 0 1 1 22-22 24 24 0 0 1-22 22z"></path>
            </svg>
        `;

        // Escape the label content to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // If label is not provided, hide it and use aria-label
        const label = this.label ? `<span>${escapeHtml(this.label)}</span>` : '';
        const ariaLabel = this.label ? '' : `aria-label="Print"`;

        // If the button is disabled, add the disabled attribute
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';

        return `
            <button ${disabled} ${ariaLabel} class="button" type="button">
                ${svg}
                ${label}
            </button>
        `;
    }

    constructor() {
        super();
        const selector = this.getAttribute('print-target');
        this.printTarget = document.querySelector(selector);
    }
    
    connectedCallback() {
        setTimeout(() => {
            this.label = this.innerHTML;
            this.innerHTML = this.buttonTemplate();
            this.removeAttribute('disabled'); // buttonTemplate() will handle the disabled state
            this.attachEvent();
        });
    }

    disconnectedCallback() {
        window.removeEventListener("afterprint", this.clearDontPrintClasses);
        this.clearDontPrintClasses();
        this.removeGlobalStyles();
    }

    attachEvent() {
        this.querySelector('button').addEventListener('click', () => {
            this.addGlobalStyles();
            // this.clearDontPrintClasses();
            window.removeEventListener("afterprint", this.clearDontPrintClasses);
            window.addEventListener("afterprint", this.clearDontPrintClasses);

            const el = this.printTarget;
            if (!el) {
                // Just add the class to the button if printing the whole page
                this.classList.add('dont-print');
            } else {
                this.printOnly(el);
            }

            window.print(); // 🖨️
        });
    }

    clearDontPrintClasses() {
        document.querySelectorAll('.dont-print').forEach(el => {
            el.classList.remove('dont-print');
        });
    }

    addGlobalStyles() {
        // Add global CSS for print styling if not already added
        if (!document.querySelector('#dont-print-style')) {
            const style = document.createElement('style');
            style.id = 'dont-print-style';
            style.textContent = `.dont-print, .button { @media print { display: none !important; } }`;
            document.head.appendChild(style);
        }
    }

    removeGlobalStyles() {
        document.querySelector('#dont-print-style').remove();
    }

    printOnly(element) {
        let currentElement = element;
        while (currentElement?.parentElement) {
            // Get all sibling elements using Array.from and children
            Array.from(currentElement.parentElement.children)
                .filter(sibling => sibling !== currentElement)
                .forEach(sibling => sibling.classList.add('dont-print'));
                
            currentElement = currentElement.parentElement;
        }
    }

    // Define the custom element unless already defined
    static tag = "print-button";
    static define(tag = this.tag) {
        this.tag = tag;
        const name = customElements.getName(this);
        if (name) return console.warn(`${this.name} already defined as <${name}>!`);
        const ce = customElements.get(tag);
        if (Boolean(ce) && ce !== this) return console.warn(`<${tag}> already defined as ${ce.name}!`);
        customElements.define(tag, this);
    }
    static {
        const tag = new URL(import.meta.url).searchParams.get("define") || this.tag;
        if (tag !== "false") this.define(tag);
    }
}