import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "#/lib/motion";

const CHARACTERS = [
	{ char: "永", meaning: "eternity" },
	{ char: "書", meaning: "to write" },
	{ char: "綴", meaning: "to compose" },
	{ char: "字", meaning: "character" },
	{ char: "道", meaning: "the way" },
];

type Point = { x: number; y: number; width: number };

/*
 * A single practice square. Line weight follows pen pressure when the device
 * reports it, and thins with speed otherwise, so mouse strokes still taper
 * like a brush.
 */
export function Practice() {
	const root = useRef<HTMLElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const [selected, setSelected] = useState(CHARACTERS[0]);
	const [guide, setGuide] = useState(true);
	const [strokes, setStrokes] = useState(0);

	const clear = useCallback(() => {
		const el = canvas.current;
		const ctx = el?.getContext("2d");
		if (!el || !ctx) return;
		ctx.clearRect(0, 0, el.width, el.height);
		setStrokes(0);
	}, []);

	useEffect(() => {
		const el = canvas.current;
		const ctx = el?.getContext("2d", { willReadFrequently: true });
		if (!el || !ctx) return;

		const ink = getComputedStyle(document.documentElement)
			.getPropertyValue("--color-ink")
			.trim();
		const resize = () => {
			const ratio = Math.min(window.devicePixelRatio, 2);
			const { width } = el.getBoundingClientRect();
			const snapshot = el.width
				? ctx.getImageData(0, 0, el.width, el.height)
				: null;
			el.width = el.height = Math.round(width * ratio);
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			if (snapshot) ctx.putImageData(snapshot, 0, 0);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(el);

		let last: Point | null = null;
		let lastTime = 0;

		const pointAt = (event: PointerEvent): Point => {
			const rect = el.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const base = rect.width / 32;
			let width = base;
			if (event.pointerType === "pen" && event.pressure > 0) {
				width = base * (0.3 + event.pressure * 1.2);
			} else if (last) {
				const speed =
					Math.hypot(x - last.x, y - last.y) /
					Math.max(1, event.timeStamp - lastTime);
				width = base * Math.max(0.35, 1.25 - speed * 0.45);
			}
			if (last) width = last.width + (width - last.width) * 0.35;
			lastTime = event.timeStamp;
			return { x, y, width };
		};

		const drawSegment = (from: Point, to: Point) => {
			ctx.strokeStyle = ink;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.lineWidth = to.width;
			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		};

		const onDown = (event: PointerEvent) => {
			event.preventDefault();
			el.setPointerCapture(event.pointerId);
			last = pointAt(event);
			drawSegment(last, last);
		};
		const onMove = (event: PointerEvent) => {
			if (!last) return;
			const events = event.getCoalescedEvents?.() ?? [event];
			for (const e of events) {
				const next = pointAt(e);
				drawSegment(last, next);
				last = next;
			}
		};
		const onUp = () => {
			if (!last) return;
			last = null;
			setStrokes((n) => n + 1);
		};

		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);
		return () => {
			observer.disconnect();
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			el.removeEventListener("pointercancel", onUp);
		};
	}, []);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.from(".practice-board", {
				rotate: -6,
				y: 120,
				opacity: 0,
				duration: 1.4,
				ease: "expo.out",
				scrollTrigger: { trigger: ".practice-board", start: "top 85%" },
			});
			gsap.from(".practice-copy > *", {
				y: 40,
				opacity: 0,
				stagger: 0.08,
				duration: 1,
				ease: "power3.out",
				scrollTrigger: { trigger: ".practice-copy", start: "top 80%" },
			});
		}, root);
		return () => ctx.revert();
	}, []);

	const choose = (next: (typeof CHARACTERS)[number]) => {
		setSelected(next);
		clear();
	};

	return (
		<section
			ref={root}
			id="practice"
			className="practice section"
			aria-labelledby="practice-title"
		>
			<div className="practice-copy">
				<div className="section-label">
					<span>04</span> Practice <span lang="ja">練習</span>
				</div>
				<h2 id="practice-title" className="practice-title">
					Your turn.
					<br />
					<em>Pick up the pen.</em>
				</h2>
				<p className="practice-lede">
					This square works like a small piece of Genkou Youshi. Trace the guide
					with a mouse, a finger, or a stylus. Pens get pressure, and everything
					else tapers with speed.
				</p>
				<fieldset className="practice-picker">
					<legend className="sr-only">Character to practice</legend>
					{CHARACTERS.map((c) => (
						<button
							key={c.char}
							type="button"
							aria-pressed={c.char === selected.char}
							onClick={() => choose(c)}
							lang="ja"
							data-magnetic
						>
							{c.char}
						</button>
					))}
				</fieldset>
				<p className="practice-meaning">
					<span lang="ja">{selected.char}</span> — {selected.meaning}
				</p>
			</div>
			<div className="practice-board">
				<div className="practice-board-head">
					<span lang="ja">原稿用紙</span>
					<span>{String(strokes).padStart(2, "0")} strokes</span>
				</div>
				<div className="practice-square" data-cursor-draw>
					<span
						className="practice-guide"
						lang="ja"
						aria-hidden="true"
						data-visible={guide}
					>
						{selected.char}
					</span>
					<canvas
						ref={canvas}
						className="practice-canvas"
						data-lenis-prevent
						aria-label={`Drawing area. Practice writing ${selected.char}.`}
					/>
				</div>
				<div className="practice-actions">
					<button
						type="button"
						onClick={() => setGuide((v) => !v)}
						aria-pressed={guide}
					>
						{guide ? "Hide guide" : "Show guide"}
					</button>
					<button type="button" onClick={clear}>
						Clear
					</button>
				</div>
			</div>
		</section>
	);
}
