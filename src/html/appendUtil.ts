export { insertAfter, insertFirst };

function insertAfter(parent: HTMLElement, after: HTMLElement, before: HTMLElement): void {
    parent.insertBefore(after, before.nextSibling);
}

function insertFirst(parent: HTMLElement, child: HTMLElement): void {
    parent.insertBefore(child, parent.firstChild);
}
