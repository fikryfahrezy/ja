import { useEffect, useRef } from "react";
import { products, studio } from "#/lib/content";
import { gsap, scrollToTarget, useLenis } from "#/lib/motion";

export function Footer() {
	const root = useRef<HTMLElement>(null);
	const lenis = useLenis();

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.from(".footer-word-char", {
				yPercent: 100,
				rotate: 8,
				stagger: 0.08,
				ease: "expo.out",
				scrollTrigger: {
					trigger: ".footer-word",
					start: "top bottom",
					end: "bottom bottom",
					scrub: 1,
				},
			});
			gsap.from(".footer-cta-line", {
				yPercent: 110,
				stagger: 0.1,
				duration: 1.2,
				ease: "expo.out",
				scrollTrigger: { trigger: ".footer-cta", start: "top 80%" },
			});
		}, root);
		return () => ctx.revert();
	}, []);

	return (
		<footer ref={root} id="contact" className="footer">
			<div className="footer-top">
				<div className="section-label">
					<span>05</span> Contact <span lang="ja">連絡</span>
				</div>
				<h2 id="footer-title" className="footer-cta">
					<span className="footer-cta-mask">
						<span className="footer-cta-line">Let's write</span>
					</span>
					<span className="footer-cta-mask">
						<span className="footer-cta-line">
							<em>something.</em>
						</span>
					</span>
				</h2>
				<a
					className="footer-button"
					href={studio.github}
					target="_blank"
					rel="noreferrer"
					data-magnetic
					data-cursor="GitHub"
				>
					<span>Say hello on GitHub</span>
					<span aria-hidden="true">↗</span>
				</a>
			</div>

			<div className="footer-grid">
				<div>
					<h3>Tools</h3>
					<ul>
						{products.map((product) => (
							<li key={product.slug}>
								<a
									href={product.links[0].href}
									target="_blank"
									rel="noreferrer"
								>
									<span lang="ja">{product.mark}</span> {product.name}
								</a>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h3>Studio</h3>
					<ul>
						<li>
							<a href="#approach">Approach</a>
						</li>
						<li>
							<a href={studio.github} target="_blank" rel="noreferrer">
								Open source
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h3>Credits</h3>
					<p>
						Learning data from KanjiVG, JMdict, KANJIDIC2, Tatoeba, and DaKanji,
						under their own licenses. See each tool's credits page.
					</p>
				</div>
				<div className="footer-top-link">
					<button
						type="button"
						onClick={() => scrollToTarget(lenis, 0)}
						data-magnetic
					>
						Back to top <span aria-hidden="true">↑</span>
					</button>
				</div>
			</div>

			<div className="footer-word" aria-hidden="true">
				<span className="footer-word-char">j</span>
				<span className="footer-word-char">a</span>
				<span className="footer-word-char footer-word-seal" lang="ja">
					字
				</span>
			</div>
			<div className="footer-bottom">
				<span>
					© {new Date().getFullYear()} {studio.name}. Made by {studio.founder}.
				</span>
				<span lang="ja">一画ずつ。</span>
			</div>
		</footer>
	);
}
