import type { exEvent } from "../exEvents.js";

export { Dialog, type tDialogState, isDialogState, type tDialogButtonType, isDialogButtonType };

class Dialog {
    private active: boolean;

    private coverElem: HTMLElement;
    private contentWrapElem: HTMLElement;
    private contentWrapHeader: HTMLElement;
    private contentWrapHeaderTitleElem: HTMLElement;
    private contentWrapMainElem: HTMLElement;
    private contentWrapFooterElem: HTMLElement;

    private buttonList: { [key in tDialogButtonType]: HTMLButtonElement };

    private callbackFunc: {
        show: () => void,
        hide: (state: tDialogState) => void,
    };
    private waitingResolver?: (state: tDialogState) => void | undefined;

    constructor(parentElem: HTMLElement) {
        this.active = false;

        this.coverElem = document.createElement("div");
        this.coverElem.classList.add("dialog-cover", "dilog-hidaden");
        this.coverElem.addEventListener("click", (e: exEvent<HTMLElement>) => { this.showCallbackFunc(e) });

        parentElem.appendChild(this.coverElem);

        this.contentWrapElem = document.createElement("div");
        this.contentWrapElem.classList.add("dialog");
        this.coverElem.appendChild(this.contentWrapElem);

        this.contentWrapHeader = document.createElement("header");
        this.contentWrapElem.appendChild(this.contentWrapHeader);
        this.contentWrapHeaderTitleElem = document.createElement("h1");
        this.contentWrapHeader.appendChild(this.contentWrapHeaderTitleElem);

        this.contentWrapMainElem = document.createElement("main");
        this.contentWrapElem.appendChild(this.contentWrapMainElem);

        this.contentWrapFooterElem = document.createElement("footer");
        this.contentWrapElem.appendChild(this.contentWrapFooterElem);

        this.buttonList = (() => {
            const list: { [key in tDialogButtonType]?: HTMLButtonElement } = {};
            for (const key of dialogButtonTypeList) {
                const btn = document.createElement("button");
                btn.classList.add(key);
                btn.textContent = dialogButtonDataList[key].name;
                btn.dataset["state"] = dialogButtonDataList[key].state;

                btn.addEventListener("click", (e: exEvent<HTMLElement>) => { this.showCallbackFunc(e) });

                list[key] = btn;
            }

            if (!((l: { [key in tDialogButtonType]?: HTMLButtonElement }): l is { [key in tDialogButtonType]: HTMLButtonElement } => {
                for (const key of dialogButtonTypeList) {
                    if (list[key] == undefined) {
                        return false;
                    }
                }
                return true;
            })(list)) {
                throw new Error("dialogの初期化エラー");
            }

            return list;
        })();

        this.callbackFunc = {
            show: () => { },
            hide: () => { },
        };
    }

    public setShowCallbackFunc(func: () => void) {
        this.callbackFunc.show = func;
    }
    public setHideCallbackFunc(func: (state: tDialogState) => void) {
        this.callbackFunc.hide = func;
    }

    public async show(title: string, contentElem: HTMLElement, mode: Set<tDialogButtonType> = new Set(["ok"])): Promise<tDialogState> {
        if (this.active || this.waitingResolver != undefined) {
            return new Promise((resolve) => {
                resolve("alreadyActive");
            });
        }
        this.active = true;
        this.callbackFunc.show();

        this.contentWrapHeaderTitleElem.textContent = title;
        this.contentWrapMainElem.textContent = "";
        this.contentWrapMainElem.appendChild(contentElem);
        this.contentWrapFooterElem.textContent = "";
        this.coverElem.classList.remove("dilog-hidaden");

        for (const key of mode) {
            const btn = this.buttonList[key];
            this.contentWrapFooterElem.appendChild(btn);
            btn.disabled = false;
        }

        return new Promise((resolve) => {
            this.waitingResolver = resolve;
        });
    }

    private showCallbackFunc(e: exEvent<HTMLElement>) {
        e.stopPropagation();
        const elem = e.currentTarget;

        if (elem !== e.target) {
            return;
        }

        this.coverElem.classList.add("dilog-hidaden");
        this.contentWrapHeaderTitleElem.textContent = "";
        this.contentWrapMainElem.textContent = "";
        this.contentWrapFooterElem.textContent = "";

        for (const key of dialogButtonTypeList) {
            this.buttonList[key].disabled = true;
        }

        if (this.waitingResolver == undefined) {
            return;
        }

        const state = ((): tDialogState => {
            if (elem === this.coverElem) {
                return "abort";
            }

            for (const key of dialogButtonTypeList) {
                if (elem === this.buttonList[key]) {
                    const state = this.buttonList[key].dataset["state"];
                    if (state != undefined && isDialogState(state)) {
                        return state;
                    }
                    break;
                }
            }

            return "unknown";
        })();

        this.callbackFunc.hide(state);
        this.waitingResolver(state);

        this.active = false;
        this.waitingResolver = undefined;
    }
}

const dialogStateList = [
    "unknown",
    "alreadyActive",
    "abort",
    "ok",
    "cancel",
    "yes",
    "no",
] as const;
type tDialogState = typeof dialogStateList[number];
function isDialogState(str: string): str is tDialogState {
    for (const s of dialogStateList) {
        if (str === s) {
            return true;
        }
    }
    return false;
}

const dialogButtonTypeList = [
    "ok",
    "cancel",
    "yes",
    "no",
] as const;
const dialogButtonDataList: { [key in tDialogButtonType]: { name: string, state: tDialogState } } = {
    ok: {
        name: "OK",
        state: "ok",
    },
    cancel: {
        name: "キャンセル",
        state: "cancel",
    },
    yes: {
        name: "はい",
        state: "yes",
    },
    no: {
        name: "いいえ",
        state: "no",
    },
};
type tDialogButtonType = typeof dialogButtonTypeList[number];
function isDialogButtonType(str: string): str is tDialogButtonType {
    for (const t of dialogButtonTypeList) {
        if (str === t) {
            return true;
        }
    }
    return false;
}
