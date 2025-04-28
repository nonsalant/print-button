class PrintElement extends HTMLElement {
    buttonTemplate() {
        // Styles can be moved to global CSS
        const buttonStyles = `display: flex; gap: .25em; align-items: center;`;
        const svgStyles = `width: 1em; height: 1em;`;

        const svg = `
			<svg style="${svgStyles}" viewBox="0 0 512 512" stroke="currentColor" fill="currentColor" stroke-width="0">
				<path d="M400 96V56a8 8 0 0 0-8-8H120a8 8 0 0 0-8 8v40"></path><rect width="208" height="160" x="152" y="264" fill="none" rx="4" ry="4"></rect><path d="M408 112H104a56 56 0 0 0-56 56v208a8 8 0 0 0 8 8h56v72a8 8 0 0 0 8 8h272a8 8 0 0 0 8-8v-72h56a8 8 0 0 0 8-8V168a56 56 0 0 0-56-56zm-48 308a4 4 0 0 1-4 4H156a4 4 0 0 1-4-4V268a4 4 0 0 1 4-4h200a4 4 0 0 1 4 4zm34-212.08a24 24 0 1 1 22-22 24 24 0 0 1-22 22z"></path>
			</svg>
        `;

        // If label is not provided, hide it and use aria-label
        const label = this.label ? `<span>${this.label}</span>` : '';
        const ariaLabel = this.label ? '' : `aria-label="Print"`;

        return `
			<button style="${buttonStyles}" type="button" ${ariaLabel}>
				${svg}
				${label}
			</button>
        `;
    }

    constructor() {
        super();
    }
    
    connectedCallback() {
        setTimeout(() => {
            const selector = this.getAttribute('print-target');
            this.printTarget = document.querySelector(selector);
            this.label = this.innerHTML;
            this.innerHTML = this.buttonTemplate();
            this.attachEvent();
        });
    }

    disconnectedCallback() {
        this.clearDontPrintClasses();
        this.removeGlobalStyles();
    }

    attachEvent() {
        this.querySelector('button').addEventListener('click', () => {
            this.addGlobalStyles();
            this.clearDontPrintClasses();

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
            style.textContent = `.dont-print { @media print { display: none !important; } }`;
            document.head.appendChild(style);
        }
    }

    removeGlobalStyles() {
        document.querySelector('#dont-print-style').remove();
    }

    printOnly(element) {
        let currentElement = element;
        while (currentElement) {
            if (!currentElement.parentNode) break;
            let sibling = currentElement.parentNode.firstChild;
            while (sibling) {
                if (sibling !== currentElement) {
                    if (sibling.nodeType === 1) // ensure it's an element
                        sibling.classList.add('dont-print');
                }
                sibling = sibling.nextSibling;
            }
            // Move to the parent element
            currentElement = currentElement.parentNode;
        }
    }

}

customElements.define('print-button', PrintElement);
