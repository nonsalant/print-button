# print-button
 Web Component to print only a specific element instead of the whole page (which is what `window.print()` does by default).

**[CodePen Demo](https://codepen.io/nonsalant/pen/yyBmeBp)**

## Examples

Print a specific element on the page:
```html
<print-button print-target=".element-to-print">
    Print
</print-button>
```
Print the whole page:
```html
<print-button>Print</print-button>
```

Multiple print buttons on the same page:
```html
<print-button print-target="#table-1">
    Print the 1st table
</print-button>
<table id="table-1">...</table>

<print-button print-target="#table-2">
    Print the 2nd table
</print-button>
<table id="table-2">...</table>
```

Just the icon:
```html
<print-button print-target=".element-to-print"></print-button>
```

## Attributes and Content
- `print-target` attribute: CSS selector of the element to print. By default (if not provided), it prints the whole page except for the button itself.
- Content: The text content of the button. If left empty, `aria-label="Print"` is added to the button (which will be a simple icon button).

## Including the script

The script can be included anywhere on the page... 
- as a module:
```html
<script type="module" src="print-button.js"></script>
```
- or as a non-module script tag:
```html
<script src="print-button.js"></script>
```

## How it works
The `printOnly()` method:
- starts at the target, 
- adds a `.dont-print` class to its siblings, 
- moves to the parent and adds the class to _its_ siblings, 
- and continues up the DOM recursively adding the `.dont-print` class to all of the "uncles" (non-ancestors) of the target element.

## Other notes
The `setTimeout(()=>{...})` wrapping the insides of the `connectedCallback()` lifecycle method allows the script to be used as a non-module script tag (in addition to the module option) from anywhere on the page, including the header, by adding a ~4ms delay which should be enough for the DOM to be ready. <br>Increase the delay if needed (if your `print-target` takes longer to load), e.g:
```javascript
connectedCallback() {
    setTimeout(() => {
        //...
    }, 150);
}
```

## Credits
- Print icon from [Ionicons 5: print-sharp](https://github.com/ionic-team/ionicons/blob/main/src/svg/print-sharp.svg).