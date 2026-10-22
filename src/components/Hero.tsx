import { useEffect, useRef } from "react";
import {
	gsap,
	onIntro,
	prefersReducedMotion,
	ScrollTrigger,
} from "#/lib/motion";
import { ManuscriptScene } from "#/three/manuscript-scene";

const SCENE_FONT =
	'"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif';

function readColor(name: string) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

export function Hero() {
	const root = useRef<HTMLElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const section = root.current;
		const canvasEl = canvas.current;
		if (!section || !canvasEl) return;

		let scene: ManuscriptScene | null = null;
		let disposed = false;
		const reduced = prefersReducedMotion();
		const cleanups: (() => void)[] = [];

		const ctx = gsap.context(() => {
			gsap.set(".hero-line-inner", { yPercent: 110 });
			gsap.set(".hero-fade", { opacity: 0, y: 20 });

			gsap
				.timeline({
					scrollTrigger: {
						trigger: section,
						start: "top top",
						end: "bottom bottom",
						scrub: true,
					},
				})
				.to(".hero-copy", { yPercent: -30, opacity: 0, ease: "none" }, 0)
				.to(".hero-meta", { opacity: 0, ease: "none", duration: 0.3 }, 0);
		}, section);

		const start = async () => {
			await document.fonts?.load(
				`500 64px ${SCENE_FONT}`,
				"手で覚える日本語書綴毎画",
			);
			if (disposed) return;
			try {
				scene = new ManuscriptScene(
					canvasEl,
					{
						paper: readColor("--color-sheet"),
						ink: readColor("--color-ink"),
						line: readColor("--color-sage"),
						accent: readColor("--color-shu"),
					},
					SCENE_FONT,
				);
			} catch {
				section.classList.add("no-webgl");
				return;
			}
			const current = scene;

			const trigger = ScrollTrigger.create({
				trigger: section,
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => current.setScroll(self.progress),
			});
			const visibility = ScrollTrigger.create({
				trigger: section,
				start: "top bottom",
				end: "bottom top",
				onToggle: (self) => {
					if (self.isActive && !reduced) current.start();
					else current.stop();
				},
			});

			const onPointer = (event: PointerEvent) => {
				const rect = canvasEl.getBoundingClientRect();
				current.setPointer(
					((event.clientX - rect.left) / rect.width) * 2 - 1,
					-((event.clientY - rect.top) / rect.height) * 2 + 1,
				);
			};
			const onLeave = () => current.clearPointer();
			const resizer = new ResizeObserver(() => current.resize());
			resizer.observe(canvasEl);
			section.addEventListener("pointermove", onPointer);
			section.addEventListener("pointerleave", onLeave);

			cleanups.push(() => {
				trigger.kill();
				visibility.kill();
				resizer.disconnect();
				section.removeEventListener("pointermove", onPointer);
				section.removeEventListener("pointerleave", onLeave);
			});

			if (reduced) {
				current.intro.value = 1;
				current.reveal.value = current.glyphCount + 2;
				current.render();
			}
		};

		const off = onIntro(() =>
			ctx.add(() => {
				const ready = start();
				gsap.to(".hero-line-inner", {
					yPercent: 0,
					duration: 1.4,
					stagger: 0.12,
					ease: "expo.out",
					delay: 0.25,
				});
				gsap.to(".hero-fade", {
					opacity: 1,
					y: 0,
					duration: 1,
					stagger: 0.1,
					delay: 0.8,
					ease: "power3.out",
				});
				ready.then(() => {
					if (!scene || reduced) return;
					gsap.to(scene.intro, {
						value: 1,
						duration: 2.4,
						ease: "power2.inOut",
					});
					gsap.to(scene.reveal, {
						value: scene.glyphCount + 2,
						duration: 3.2,
						delay: 0.9,
						ease: "power1.inOut",
					});
				});
			}),
		);

		return () => {
			disposed = true;
			off();
			ctx.revert();
			for (const cleanup of cleanups) cleanup();
			scene?.dispose();
		};
	}, []);

	return (
		<section ref={root} id="top" className="hero" aria-labelledby="hero-title">
			<div className="hero-stage">
				<canvas ref={canvas} className="hero-canvas" />
				<div className="hero-copy">
					<p className="eyebrow hero-fade">
						<span className="eyebrow-dot" />
						ja — tools for learning Japanese
					</p>
					<h1 id="hero-title" className="hero-title">
						<span className="hero-line">
							<span className="hero-line-inner">Japanese,</span>
						</span>
						<span className="hero-line">
							<span className="hero-line-inner">
								learned <em>by hand.</em>
							</span>
						</span>
					</h1>
					<p className="hero-lede hero-fade">
						We make quiet, focused tools for writing Japanese: a square for
						every character, a pen that types into any browser, and a page for
						one sentence a day.
					</p>
				</div>
				<div className="hero-meta">
					<aside
						className="hero-aside hero-fade"
						aria-label="Studio at a glance"
					>
						<dl>
							<div>
								<dt>Tools</dt>
								<dd>03</dd>
							</div>
							<div>
								<dt>Accounts needed</dt>
								<dd>00</dd>
							</div>
							<div>
								<dt>License</dt>
								<dd>MIT</dd>
							</div>
						</dl>
					</aside>
					<div className="hero-scroll hero-fade" aria-hidden="true">
						<span className="hero-scroll-line" />
						Scroll to turn the page
					</div>
				</div>
			</div>
		</section>
	);
}
