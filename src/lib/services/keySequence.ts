import { isPlainKey, isTypingTarget } from './keyboard';

export interface KeyStroke {
	code: string;
	repeat?: boolean;
	target?: EventTarget | null;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
}

export interface KeySequenceOptions {
	code: string;
	threshold: number | (() => number);
	windowMs?: number;
	onComplete: () => void;
}

export interface KeySequence {
	handle(stroke: KeyStroke): void;
	readonly count: number;
	reset(): void;
}

export function createKeySequence(options: KeySequenceOptions): KeySequence {
	const windowMs = options.windowMs ?? 2000;
	let count = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function reset(): void {
		count = 0;
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	return {
		get count() {
			return count;
		},
		reset,
		handle(stroke: KeyStroke): void {
			if (stroke.repeat) return;
			if (!isPlainKey(stroke)) return;
			if (isTypingTarget(stroke.target)) return;

			if (stroke.code !== options.code) {
				reset();
				return;
			}

			count++;
			if (timer !== undefined) clearTimeout(timer);

			const threshold =
				typeof options.threshold === 'function' ? options.threshold() : options.threshold;

			if (count >= threshold) {
				reset();
				options.onComplete();
				return;
			}

			timer = setTimeout(reset, windowMs);
		}
	};
}
