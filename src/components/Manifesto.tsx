import { Fragment, useEffect, useRef } from "react";
import { gsap } from "#/lib/motion";

type Token = string | { jp: string; gloss: string };

const STATEMENT: Token[] = [
	"A language sticks when your hand remembers it. So we build small tools around the oldest study method there is:",
	{ jp: "書く", gloss: "to write" },
	"— one square, one word, one sentence at a time. No streaks to protect, no accounts to make. Just the next",
	{ jp: "一画", gloss: "stroke" },
	"and the quiet satisfaction of a page filling up.",
];

export function Manifesto() {
	const root = useRef<HTMLElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".manifesto-word",
				{ opacity: 0.12 },
				{
					opacity: 1,
					stagger: 0.05,
					ease: "none",
					scrollTrigger: {
						trigger: ".manifesto-text",
						start: "top 78%",
						end: "bottom 45%",
						scrub: true,
					},
				},
			);
			gsap.from(".manifesto-chip", {
				rotate: -14,
				scale: 0.4,
				stagger: 0.2,
				ease: "back.out(2)",
				scrollTrigger: {
					trigger: ".manifesto-text",
					start: "top 70%",
					end: "bottom 50%",
					scrub: 1,
				},
			});
			gsap.to(".manifesto-ghost", {
				yPercent: -40,
				ease: "none",
				scrollTrigger: {
					trigger: root.current,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			});
		}, root);
		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={root}
			className="manifesto section"
			aria-labelledby="manifesto-label"
		>
			<span className="manifesto-ghost" lang="ja" aria-hidden="true">
				道
			</span>
			<div className="section-label" id="manifesto-label">
				<span>01</span> Studio <span lang="ja">私たち</span>
			</div>
			<p className="manifesto-text">
				{STATEMENT.map((token, i) =>
					typeof token === "string" ? (
						<Fragment key={token}>
							{token.split(" ").map((word, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: words repeat within the statement
								<span key={`${i}-${j}`} className="manifesto-word">
									{word}{" "}
								</span>
							))}
						</Fragment>
					) : (
						<span key={token.jp} className="manifesto-word manifesto-chip">
							<span lang="ja">{token.jp}</span>
							<small>{token.gloss}</small>
						</span>
					),
				)}
			</p>
		</section>
	);
}
