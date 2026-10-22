import { useEffect, useRef } from "react";
import { gsap } from "#/lib/motion";

/*
 * A two-part cursor: a dot that tracks exactly and a ring that trails. Any
 * element with data-cursor="Label" grows the ring and shows that label;
 * data-cursor-draw shrinks the ring to a nib, and data-magnetic pulls the
 * element toward the pointer.
 */
export function Cursor() {
	const ring = useRef<HTMLDivElement>(null);
	const dot = useRef<HTMLDivElement>(null);
	const label = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
			return;
		}
		const ringEl = ring.current;
		const dotEl = dot.current;
		if (!ringEl || !dotEl) return;
		document.documentElement.classList.add("has-cursor");

		const ringX = gsap.quickTo(ringEl, "x", { duration: 0.5, ease: "power3" });
		const ringY = gsap.quickTo(ringEl, "y", { duration: 0.5, ease: "power3" });
		const dotX = gsap.quickTo(dotEl, "x", { duration: 0.08 });
		const dotY = gsap.quickTo(dotEl, "y", { duration: 0.08 });

		let magnet: HTMLElement | null = null;

		const onMove = (event: PointerEvent) => {
			ringX(event.clientX);
			ringY(event.clientY);
			dotX(event.clientX);
			dotY(event.clientY);
			gsap.to([ringEl, dotEl], { opacity: 1, duration: 0.3 });

			if (magnet) {
				const rect = magnet.getBoundingClientRect();
				gsap.to(magnet, {
					x: (event.clientX - (rect.left + rect.width / 2)) * 0.3,
					y: (event.clientY - (rect.top + rect.height / 2)) * 0.3,
					duration: 0.6,
					ease: "power3",
				});
			}
		};

		const onOver = (event: PointerEvent) => {
			const target = event.target as HTMLElement;
			const labelled = target.closest<HTMLElement>("[data-cursor]");
			const interactive = target.closest("a, button, [role='button']");
			const nextMagnet = target.closest<HTMLElement>("[data-magnetic]");

			if (magnet && magnet !== nextMagnet) {
				gsap.to(magnet, {
					x: 0,
					y: 0,
					duration: 0.8,
					ease: "elastic.out(1, 0.4)",
				});
			}
			magnet = nextMagnet;

			const text = labelled?.dataset.cursor ?? "";
			if (label.current) label.current.textContent = text;
			const drawing = target.closest("[data-cursor-draw]");
			ringEl.dataset.state = drawing
				? "draw"
				: text
					? "label"
					: interactive
						? "hover"
						: "";
			dotEl.dataset.state = text || interactive ? "hidden" : "";
		};

		const onLeave = () =>
			gsap.to([ringEl, dotEl], { opacity: 0, duration: 0.3 });
		const onDown = () => gsap.to(ringEl, { scale: 0.8, duration: 0.2 });
		const onUp = () => gsap.to(ringEl, { scale: 1, duration: 0.4 });

		window.addEventListener("pointermove", onMove);
		document.addEventListener("pointerover", onOver);
		document.documentElement.addEventListener("pointerleave", onLeave);
		window.addEventListener("pointerdown", onDown);
		window.addEventListener("pointerup", onUp);
		return () => {
			document.documentElement.classList.remove("has-cursor");
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerover", onOver);
			document.documentElement.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointerup", onUp);
		};
	}, []);

	return (
		<>
			<div ref={ring} className="cursor-ring" aria-hidden="true">
				<span ref={label} className="cursor-label" />
			</div>
			<div ref={dot} className="cursor-dot" aria-hidden="true" />
		</>
	);
}
