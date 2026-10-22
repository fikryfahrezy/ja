import { useEffect, useRef } from "react";
import {
	finishIntro,
	gsap,
	prefersReducedMotion,
	useLenis,
} from "#/lib/motion";

const WORD = ["日", "本", "語"];

export function Preloader() {
	const root = useRef<HTMLDivElement>(null);
	const counter = useRef<HTMLSpanElement>(null);
	const lenis = useLenis();

	useEffect(() => {
		const el = root.current;
		if (!el || !lenis) return;
		lenis.stop();
		window.scrollTo(0, 0);

		const reduced = prefersReducedMotion();
		const count = { value: 0 };
		const fontsReady = document.fonts?.ready ?? Promise.resolve();

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ paused: true });
			tl.from(".preloader-cell", {
				scale: 0.6,
				opacity: 0,
				duration: 0.6,
				stagger: 0.08,
				ease: "power3.out",
			})
				.fromTo(
					".preloader-glyph",
					{ clipPath: "inset(0% 0% 100% 0%)" },
					{
						clipPath: "inset(0% 0% 0% 0%)",
						duration: 0.9,
						stagger: 0.28,
						ease: "power2.inOut",
					},
					0.3,
				)
				.to(
					count,
					{
						value: 100,
						duration: 1.7,
						ease: "power2.inOut",
						onUpdate: () => {
							if (counter.current) {
								counter.current.textContent = String(
									Math.round(count.value),
								).padStart(3, "0");
							}
						},
					},
					0,
				)
				.to(".preloader-meta", { opacity: 0, duration: 0.3 }, ">-0.1")
				.to(
					".preloader-cell",
					{
						y: -40,
						opacity: 0,
						stagger: 0.05,
						duration: 0.5,
						ease: "power2.in",
					},
					"<",
				)
				.to(el, {
					clipPath: "inset(0% 0% 100% 0%)",
					duration: 1,
					ease: "expo.inOut",
					onStart: () => {
						lenis.start();
						finishIntro();
					},
				});

			if (reduced) tl.timeScale(4);
			fontsReady.then(() => tl.play());
		}, el);

		return () => {
			ctx.revert();
			lenis.start();
		};
	}, [lenis]);

	return (
		<div ref={root} className="preloader" aria-hidden="true">
			<div className="preloader-sheet">
				{WORD.map((char) => (
					<div key={char} className="preloader-cell">
						<span className="preloader-glyph" lang="ja">
							{char}
						</span>
					</div>
				))}
			</div>
			<div className="preloader-meta">
				<span>ja — 日本語の道具</span>
				<span ref={counter} className="preloader-count">
					000
				</span>
			</div>
		</div>
	);
}
