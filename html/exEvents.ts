export type { exEvent, exMouseEvent, exPointerEvent };

interface exEvent<T extends EventTarget> extends Event {
    currentTarget: T | null;
}

interface exPointerEvent<T extends EventTarget> extends PointerEvent {
    currentTarget: T | null;
}

interface exMouseEvent<T extends EventTarget> extends MouseEvent {
    currentTarget: T | null;
}
