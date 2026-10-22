import { useEffect, useRef } from "react";
import { type Product, products } from "#/lib/content";
import { gsap } from "#/lib/motion";

function TiltFrame({ product }: { product: Product }) {
	const frame = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = frame.current;
		if (!el || !window.matchMedia("(hover: hover)").matches) return;
		const rotateX = gsap.quickTo(el, "rotationX", {
			duration: 0.8,
			ease: "power3",
		});
		const rotateY = gsap.quickTo(el, "rotationY", {
			duration: 0.8,
			ease: "power3",
		});
		const onMove = (event: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width - 0.5;
			const y = (event.clientY - rect.top) / rect.height - 0.5;
			rotateY(x * 14);
			rotateX(-y * 14);
			el.style.setProperty("--glare-x", `${(x + 0.5) * 100}%`);
			el.style.setProperty("--glare-y", `${(y + 0.5) * 100}%`);
		};
		const onLeave = () => {
			rotateX(0);
			rotateY(0);
		};
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerleave", onLeave);
		return () => {
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerleave", onLeave);
		};
	}, []);

	return (
		<div className="product-frame-wrap">
			<div ref={frame} className="product-frame" data-cursor={product.name}>
				<div className="product-frame-bar" aria-hidden="true">
					<span />
					<span />
					<span />
					<em>{product.slug}</em>
				</div>
				<img
					src={product.image}
					alt={product.imageAlt}
					loading="lazy"
					decoding="async"
				/>
				<div className="product-frame-glare" aria-hidden="true" />
			</div>
		</div>
	);
}

function ProductPanel({ product }: { product: Product }) {
	return (
		<article
			className="product-panel"
			aria-labelledby={`${product.slug}-title`}
		>
			<span className="product-mark" lang="ja" aria-hidden="true">
				{product.mark}
			</span>
			<div className="product-info">
				<p className="product-index">
					<span>{product.index}</span>
					<span>/03</span>
					<span className="product-stage" lang="ja">
						{product.stage}
					</span>
				</p>
				<h3 id={`${product.slug}-title`} className="product-name">
					{product.name}
					<span lang="ja">{product.japanese}</span>
				</h3>
				<p className="product-reading">{product.reading}</p>
				<p className="product-tagline">{product.tagline}</p>
				<p className="product-description">{product.description}</p>
				<ul className="product-features">
					{product.features.map((feature) => (
						<li key={feature}>{feature}</li>
					))}
				</ul>
				<div className="product-footer">
					<ul className="product-platforms" aria-label="Platforms">
						{product.platforms.map((platform) => (
							<li key={platform}>{platform}</li>
						))}
					</ul>
					<div className="product-links">
						{product.links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								target="_blank"
								rel="noreferrer"
								data-magnetic
							>
								{link.label} <span aria-hidden="true">↗</span>
							</a>
						))}
					</div>
				</div>
			</div>
			<TiltFrame product={product} />
		</article>
	);
}

export function Products() {
	const root = useRef<HTMLElement>(null);
	const track = useRef<HTMLDivElement>(null);
	const progress = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const section = root.current;
		const trackEl = track.current;
		if (!section || !trackEl) return;

		const mm = gsap.matchMedia();
		mm.add(
			"(min-width: 960px) and (prefers-reduced-motion: no-preference)",
			() => {
				const distance = () => trackEl.scrollWidth - window.innerWidth;
				const scroll = gsap.to(trackEl, {
					x: () => -distance(),
					ease: "none",
					scrollTrigger: {
						trigger: section,
						start: "top top",
						end: () => `+=${distance()}`,
						pin: true,
						scrub: 1,
						invalidateOnRefresh: true,
						onUpdate: (self) => {
							progress.current?.style.setProperty(
								"--progress",
								String(self.progress),
							);
						},
					},
				});

				for (const mark of gsap.utils.toArray<HTMLElement>(
					".product-mark",
					section,
				)) {
					gsap.fromTo(
						mark,
						{ xPercent: 35 },
						{
							xPercent: -35,
							ease: "none",
							scrollTrigger: {
								trigger: mark.parentElement,
								containerAnimation: scroll,
								start: "left right",
								end: "right left",
								scrub: true,
							},
						},
					);
				}
				for (const frame of gsap.utils.toArray<HTMLElement>(
					".product-frame-wrap",
					section,
				)) {
					gsap.fromTo(
						frame,
						{ rotationY: -28, scale: 0.86 },
						{
							rotationY: 0,
							scale: 1,
							ease: "power2.out",
							scrollTrigger: {
								trigger: frame,
								containerAnimation: scroll,
								start: "left 95%",
								end: "center 55%",
								scrub: true,
							},
						},
					);
				}
				gsap.from(".products-intro-path li", {
					y: 60,
					opacity: 0,
					stagger: 0.12,
					duration: 1,
					ease: "expo.out",
					scrollTrigger: { trigger: section, start: "top 60%" },
				});
			},
		);
		mm.add("(max-width: 959px), (prefers-reduced-motion: reduce)", () => {
			for (const panel of gsap.utils.toArray<HTMLElement>(
				".product-panel",
				section,
			)) {
				gsap.from(panel, {
					y: 80,
					opacity: 0,
					duration: 1.1,
					ease: "expo.out",
					scrollTrigger: { trigger: panel, start: "top 85%" },
				});
			}
		});
		return () => mm.revert();
	}, []);

	return (
		<section
			ref={root}
			id="work"
			className="products"
			aria-labelledby="products-title"
		>
			<div ref={track} className="products-track">
				<div className="products-intro">
					<div className="section-label">
						<span>02</span> Work <span lang="ja">作品</span>
					</div>
					<h2 id="products-title" className="products-title">
						Three tools.
						<br />
						<em>One habit.</em>
					</h2>
					<p className="products-lede">
						Each tool takes one step of learning to write: forming a character,
						getting it into your devices, and putting it in a sentence.
					</p>
					<ol className="products-intro-path" aria-label="Learning path">
						<li>
							<span lang="ja">字</span>Character
						</li>
						<li aria-hidden="true">→</li>
						<li>
							<span lang="ja">語</span>Word
						</li>
						<li aria-hidden="true">→</li>
						<li>
							<span lang="ja">文</span>Sentence
						</li>
					</ol>
				</div>
				{products.map((product) => (
					<ProductPanel key={product.slug} product={product} />
				))}
			</div>
			<div ref={progress} className="products-progress" aria-hidden="true">
				<span />
			</div>
		</section>
	);
}
