export { exEvent, exMouseEvent, exPointerEvent };

interface exEvent<T extends EventTarget> extends Event {
    currentTarget: T;
}

interface exPointerEvent<T extends EventTarget> extends PointerEvent {
    currentTarget: T;
}

interface exMouseEvent<T extends EventTarget> extends MouseEvent {
    currentTarget: T;
}
