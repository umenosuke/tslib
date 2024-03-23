export { getSelected, getSelectedAll };

function getSelected(select: HTMLSelectElement): string | undefined {
    for (const opt of select.options) {
        if (opt.selected) {
            return opt.value;
        }
    }

    return;
}

function getSelectedAll(select: HTMLSelectElement): string[] {
    const res: string[] = [];

    for (const opt of select.options) {
        if (opt.selected) {
            res.push(opt.value);
        }
    }

    return res;
}
