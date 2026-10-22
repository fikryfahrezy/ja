import { useEffect, useRef, useState } from "react";
import { principles } from "#/lib/content";
import { gsap } from "#/lib/motion";

// Hand-drawn approximations of the five strokes of 永, in writing order.
const STROKES = [
	"M50 13 C54 16 58 20 60 26",
	"M37 34 L61 31 C64 31 65 33 64 36 L63 88 C63 95 59 96 55 92 L49 86",
	"M21 50 L45 47 C43 59 33 71 17 80",
	"M86 39 C80 46 73 52 66 56",
	"M63 55 C70 67 81 79 95 86",
];

export function Method() {
	const root = useRef<HTMLElement>(null);
	const [active, setActive] = useState(0);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const paths = gsap.utils.toArray<SVGPathElement>(".method-stroke");
			// Round caps would otherwise show as dots before a stroke begins.
			gsap.set(paths, { strokeDashoffset: 1, opacity: 0 });

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: root.current,
					start: "top top",
					end: "+=260%",
					pin: true,
					scrub: 0.6,
					onUpdate: (self) => {
						setActive(
							Math.min(
								principles.length - 1,
								Math.floor(self.progress * principles.length * 1.02),
							),
						);
					},
				},
			});
			paths.forEach((path, i) => {
				tl.set(path, { opacity: 1 }, i * 1.1 + 0.01).to(
					path,
					{ strokeDashoffset: 0, duration: 1, ease: "power1.inOut" },
					i * 1.1,
				);
			});
			tl.to(
				".method-seal",
				{
					scale: 1,
					opacity: 1,
					rotate: -8,
					duration: 0.5,
					ease: "back.out(3)",
				},
				">-0.1",
			);
			tl.to(
				".method-counter-fill",
				{ scaleX: 1, duration: tl.duration(), ease: "none" },
				0,
			);
		}, root);
		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={root}
			id="approach"
			className="method"
			aria-labelledby="method-title"
		>
			<div className="method-inner">
				<div className="method-copy">
					<div className="section-label">
						<span>03</span> Approach <span lang="ja">方法</span>
					</div>
					<h2 id="method-title" className="method-title">
						Every stroke,
						<br />
						<em>in its place.</em>
					</h2>
					<p className="method-lede">
						Calligraphers say <span lang="ja">永</span>, “eternity,” holds every
						basic stroke of the brush. We hold our tools to a few basics too.
					</p>
					<ol className="method-principles">
						{principles.map((p, i) => (
							<li
								key={p.index}
								data-active={i === active}
								data-past={i < active}
							>
								<span className="method-principle-index">{p.index}</span>
								<div>
									<h3>{p.title}</h3>
									<p>{p.body}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
				<figure
					className="method-figure"
					aria-label="The character 永 being written stroke by stroke"
				>
					<div className="method-square">
						<svg
							viewBox="0 0 109 109"
							className="method-svg"
							aria-hidden="true"
						>
							<line
								x1="54.5"
								y1="0"
								x2="54.5"
								y2="109"
								className="method-guide"
							/>
							<line
								x1="0"
								y1="54.5"
								x2="109"
								y2="54.5"
								className="method-guide"
							/>
							<line
								x1="0"
								y1="0"
								x2="109"
								y2="109"
								className="method-guide method-guide-faint"
							/>
							<line
								x1="109"
								y1="0"
								x2="0"
								y2="109"
								className="method-guide method-guide-faint"
							/>
							{STROKES.map((d) => (
								<path key={d} d={d} pathLength={1} className="method-stroke" />
							))}
						</svg>
						<span className="method-seal" lang="ja" aria-hidden="true">
							永
						</span>
					</div>
					<figcaption className="method-caption">
						<span lang="ja">永字八法</span>
						<span>Eiji happō, the eight principles of 永</span>
						<span className="method-counter" aria-hidden="true">
							<span className="method-counter-fill" />
						</span>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
