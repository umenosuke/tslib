import type { exMouseEvent } from "../exEvents.js";

export { Dialog, eDialogMode, eDialogState };

class Dialog {
    private _isActive: boolean;
    public get isActive(): boolean {
        return this._isActive;
    }

    private coverElem: HTMLElement;
    private contentWrapElem: HTMLElement;
    private contentWrapHeader: HTMLElement;
    private contentWrapHeaderTitleElem: HTMLElement;
    private contentWrapMainElem: HTMLElement;
    private contentWrapFooterlem: HTMLElement;
    private okBtnElem: HTMLButtonElement;
    private cancelBtnElem: HTMLButtonElement;
    private yesBtnElem: HTMLButtonElement;
    private noBtnElem: HTMLButtonElement;

    private showCallbackFunc: () => void;
    private hideCallbackFunc: (state: eDialogState) => void;

    constructor(targetElem: HTMLElement, callbackFunc = { show: () => { }, hide: (state: eDialogState) => { } }) {
        this._isActive = false;

        this.coverElem = document.createElement("div");
        this.coverElem.classList.add("dialog-cover", "dilog-hidaden");
        targetElem.appendChild(this.coverElem);

        this.contentWrapElem = document.createElement("div");
        this.contentWrapElem.classList.add("dialog");
        this.coverElem.appendChild(this.contentWrapElem);

        this.contentWrapHeader = document.createElement("header");
        this.contentWrapElem.appendChild(this.contentWrapHeader);
        this.contentWrapHeaderTitleElem = document.createElement("h1");
        this.contentWrapHeader.appendChild(this.contentWrapHeaderTitleElem);

        this.contentWrapMainElem = document.createElement("main");
        this.contentWrapElem.appendChild(this.contentWrapMainElem);

        this.contentWrapFooterlem = document.createElement("footer");
        this.contentWrapElem.appendChild(this.contentWrapFooterlem);

        this.okBtnElem = document.createElement("button");
        this.okBtnElem.classList.add("ok");
        this.okBtnElem.textContent = "OK";
        this.cancelBtnElem = document.createElement("button");
        this.cancelBtnElem.classList.add("cancel");
        this.cancelBtnElem.textContent = "キャンセル";
        this.yesBtnElem = document.createElement("button");
        this.yesBtnElem.classList.add("yes");
        this.yesBtnElem.textContent = "はい";
        this.noBtnElem = document.createElement("button");
        this.noBtnElem.classList.add("no");
        this.noBtnElem.textContent = "いいえ";

        this.showCallbackFunc = callbackFunc.show;
        this.hideCallbackFunc = callbackFunc.hide;
    }

    public setShowCallbackFunc(setShowCallbackFunc: () => void) {
        this.showCallbackFunc = setShowCallbackFunc;
    }
    public setHideCallbackFunc(hideCallbackFunc: (state: eDialogState) => void) {
        this.hideCallbackFunc = hideCallbackFunc;
    }

    public show(title: string, contentElem: HTMLElement, mode: eDialogMode = eDialogMode.ok): Promise<eDialogState> {
        if (this._isActive) {
            return new Promise((resolve) => {
                resolve(eDialogState.alreadyActive);
            });
        }
        this._isActive = true;
        this.showCallbackFunc();

        return new Promise((resolve) => {
            this.contentWrapHeaderTitleElem.textContent = title;
            this.contentWrapMainElem.textContent = "";
            this.contentWrapMainElem.appendChild(contentElem);
            this.contentWrapFooterlem.textContent = "";
            this.coverElem.classList.remove("dilog-hidaden");

            const callbackFunc = (e: exMouseEvent<HTMLElement>) => {
                e.stopPropagation();
                const elem = e.currentTarget;

                if (elem !== e.target) {
                    return;
                }

                this.coverElem.classList.add("dilog-hidaden");
                this.contentWrapHeaderTitleElem.textContent = "";
                this.contentWrapMainElem.textContent = "";
                this.contentWrapFooterlem.textContent = "";

                this.coverElem.removeEventListener("click", callbackFunc);
                this.okBtnElem.removeEventListener("click", callbackFunc);
                this.okBtnElem.disabled = true;
                this.cancelBtnElem.removeEventListener("click", callbackFunc);
                this.cancelBtnElem.disabled = true;
                this.yesBtnElem.removeEventListener("click", callbackFunc);
                this.yesBtnElem.disabled = true;
                this.noBtnElem.removeEventListener("click", callbackFunc);
                this.noBtnElem.disabled = true;

                this._isActive = false;

                switch (elem) {
                    case this.coverElem:
                        this.hideCallbackFunc(eDialogState.abort);
                        resolve(eDialogState.abort);
                        break;
                    case this.okBtnElem:
                        this.hideCallbackFunc(eDialogState.ok);
                        resolve(eDialogState.ok);
                        break;
                    case this.cancelBtnElem:
                        this.hideCallbackFunc(eDialogState.cancel);
                        resolve(eDialogState.cancel);
                        break;
                    case this.yesBtnElem:
                        this.hideCallbackFunc(eDialogState.yes);
                        resolve(eDialogState.yes);
                        break;
                    case this.noBtnElem:
                        this.hideCallbackFunc(eDialogState.no);
                        resolve(eDialogState.no);
                        break;
                    default:
                        this.hideCallbackFunc(eDialogState.unknown);
                        resolve(eDialogState.unknown);
                        break;
                }
            };


            this.coverElem.addEventListener("click", callbackFunc);
            switch (mode) {
                case eDialogMode.ok:
                    this.okBtnElem.addEventListener("click", callbackFunc);
                    this.okBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.okBtnElem);
                    break;
                case eDialogMode.okcancel:
                    this.okBtnElem.addEventListener("click", callbackFunc);
                    this.okBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.okBtnElem);
                    this.cancelBtnElem.addEventListener("click", callbackFunc);
                    this.cancelBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.cancelBtnElem);
                    break;
                case eDialogMode.yesno:
                    this.yesBtnElem.addEventListener("click", callbackFunc);
                    this.yesBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.yesBtnElem);
                    this.noBtnElem.addEventListener("click", callbackFunc);
                    this.noBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.noBtnElem);
                    break;
                case eDialogMode.yesnocancel:
                    this.yesBtnElem.addEventListener("click", callbackFunc);
                    this.yesBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.yesBtnElem);
                    this.noBtnElem.addEventListener("click", callbackFunc);
                    this.noBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.noBtnElem);
                    this.cancelBtnElem.addEventListener("click", callbackFunc);
                    this.cancelBtnElem.disabled = false;
                    this.contentWrapFooterlem.appendChild(this.cancelBtnElem);
                    break;
            }
        });
    }
}

enum eDialogMode {
    ok = "ok",
    okcancel = "okcancel",
    yesno = "yesno",
    yesnocancel = "yesnocancel"
}

enum eDialogState {
    unknown = "unknown",
    alreadyActive = "alreadyActive",
    abort = "abort",
    ok = "ok",
    cancel = "cancel",
    yes = "yes",
    no = "no"
}
