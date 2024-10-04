export { getSelected };

/**
 * @deprecated
 * 
 * select.selectedOptions[0]?.value で十分
 */
function getSelected(select: HTMLSelectElement): string | undefined {
    for (const opt of select.options) {
        if (opt.selected) {
            return opt.value;
        }
    }

    return;
}
