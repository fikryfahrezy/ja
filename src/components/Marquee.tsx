import { useEffect, useRef } from "react";
import { vocabulary } from "#/lib/content";
import { gsap, useLenis } from "#/lib/motion";

/*
 * An endless vocabulary ribbon. It drifts on its own and borrows Lenis's
 * scroll velocity, flipping direction when the reader scrolls back up.
 */
export function Marquee() {
	const root = useRef<HTMLDivElement>(null);
	const lenis = useLenis();

	useEffect(() => {
		const el = root.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
			return;
		const rows = gsap.utils.toArray<HTMLElement>(".marquee-row", el);
		const offsets = rows.map(() => 0);
		let direction = 1;
		let boost = 0;

		const onScroll = ({ velocity }: { velocity: number }) => {
			if (Math.abs(velocity) > 0.5) direction = Math.sign(velocity);
			boost = Math.min(Math.abs(velocity) * 0.6, 30);
		};
		lenis?.on("scroll", onScroll);

		const tick = (_time: number, delta: number) => {
			boost *= 0.92;
			rows.forEach((row, i) => {
				const half = row.scrollWidth / 2;
				const sign = i % 2 === 0 ? -1 : 1;
				offsets[i] +=
					sign * direction * (0.04 * delta + boost) * (i % 2 ? 0.8 : 1);
				offsets[i] = gsap.utils.wrap(-half, 0, offsets[i]);
				row.style.transform = `translate3d(${offsets[i]}px, 0, 0)`;
			});
			el.style.setProperty(
				"--skew",
				`${Math.max(-8, Math.min(8, boost * direction * -0.3))}deg`,
			);
		};
		gsap.ticker.add(tick);
		return () => {
			gsap.ticker.remove(tick);
			lenis?.off("scroll", onScroll);
		};
	}, [lenis]);

	const items = [...vocabulary, ...vocabulary];

	return (
		<div ref={root} className="marquee" role="marquee" aria-label="Vocabulary">
			<div className="marquee-row">
				{items.map((word, i) => (
					<span
						key={`${word.romaji}-${i < vocabulary.length ? "a" : "b"}`}
						className="marquee-item"
						aria-hidden={i >= vocabulary.length}
					>
						<span lang="ja">{word.jp}</span>
						<em>{word.romaji}</em>
						<span className="marquee-dot" aria-hidden="true" />
					</span>
				))}
			</div>
			<div className="marquee-row marquee-row-alt" aria-hidden="true">
				{items.map((word, i) => (
					<span
						key={`${word.romaji}-${i < vocabulary.length ? "a" : "b"}`}
						className="marquee-item"
					>
						{word.en}
						<span className="marquee-dot" />
					</span>
				))}
			</div>
		</div>
	);
}
