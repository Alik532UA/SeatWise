/**
 * Захисти обробника гарячих клавіш (HOTKEYS-v10 § 2).
 */
export function isTypingTarget(target?: EventTarget | null): boolean {
	if (!target || !(target instanceof HTMLElement)) return false;
	const tag = target.tagName.toLowerCase();
	if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
	return target.isContentEditable;
}

export function isPlainKey(event: {
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
}): boolean {
	return !event.ctrlKey && !event.metaKey && !event.altKey;
}

export function acceptsShortcut(event: KeyboardEvent): boolean {
	if (event.repeat) return false;
	if (!isPlainKey(event)) return false;
	if (isTypingTarget(event.target)) return false;
	return true;
}
