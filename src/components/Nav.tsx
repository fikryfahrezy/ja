import { useEffect, useRef, useState } from "react";
import { gsap, onIntro, useLenis } from "#/lib/motion";

const LINKS = [
	{ href: "#work", label: "Work", jp: "作品" },
	{ href: "#approach", label: "Approach", jp: "方法" },
	{ href: "#practice", label: "Practice", jp: "練習" },
	{ href: "#contact", label: "Contact", jp: "連絡" },
];

function useJapanTime() {
	const [time, setTime] = useState("--:--");
	useEffect(() => {
		const format = new Intl.DateTimeFormat("en-GB", {
			timeZone: "Asia/Tokyo",
			hour: "2-digit",
			minute: "2-digit",
		});
		const update = () => setTime(format.format(new Date()));
		update();
		const id = window.setInterval(update, 15_000);
		return () => window.clearInterval(id);
	}, []);
	return time;
}

export function Logo({ className = "" }: { className?: string }) {
	return (
		<span className={`logo ${className}`}>
			<span className="logo-seal" lang="ja">
				字
			</span>
			<span className="logo-word">ja</span>
		</span>
	);
}

export function Nav() {
	const lenis = useLenis();
	const root = useRef<HTMLElement>(null);
	const menu = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const time = useJapanTime();

	useEffect(() => {
		const el = root.current;
		if (!el) return;
		gsap.set(el, { yPercent: -120 });
		const off = onIntro(() =>
			gsap.to(el, { yPercent: 0, duration: 1.2, delay: 0.5, ease: "expo.out" }),
		);
		return () => {
			off();
		};
	}, []);

	useEffect(() => {
		if (!lenis) return;
		const el = root.current;
		let hidden = false;
		const onScroll = ({
			scroll,
			direction,
		}: {
			scroll: number;
			direction: number;
		}) => {
			const shouldHide = direction === 1 && scroll > 200;
			if (shouldHide !== hidden && el && !open) {
				hidden = shouldHide;
				gsap.to(el, {
					yPercent: hidden ? -120 : 0,
					duration: 0.6,
					ease: "power3.out",
				});
			}
			el?.classList.toggle("is-scrolled", scroll > 40);
		};
		lenis.on("scroll", onScroll);
		return () => lenis.off("scroll", onScroll);
	}, [lenis, open]);

	useEffect(() => {
		if (!lenis) return;
		if (open) lenis.stop();
		else lenis.start();
	}, [open, lenis]);

	// Lenis's anchor handling scrolls; this only closes the overlay first.
	useEffect(() => {
		const el = menu.current;
		if (!el) return;
		const onClick = (event: MouseEvent) => {
			if ((event.target as HTMLElement).closest("a")) {
				lenis?.start();
				setOpen(false);
			}
		};
		el.addEventListener("click", onClick);
		return () => el.removeEventListener("click", onClick);
	}, [lenis]);

	return (
		<>
			<header ref={root} className="nav" data-menu-open={open}>
				<a href="#top" className="nav-logo" aria-label="ja, back to top">
					<Logo />
				</a>
				<nav className="nav-links" aria-label="Main">
					{LINKS.map((link) => (
						<a key={link.href} href={link.href} className="nav-link">
							<span className="nav-link-roll" data-alt={link.jp}>
								{link.label}
							</span>
						</a>
					))}
				</nav>
				<div className="nav-meta">
					<span className="nav-time">
						<span className="nav-pulse" aria-hidden="true" />
						Japan {time}
					</span>
					<button
						type="button"
						className="nav-menu"
						aria-expanded={open}
						aria-controls="menu"
						onClick={() => setOpen((v) => !v)}
					>
						{open ? "Close" : "Menu"}
					</button>
				</div>
			</header>
			<div
				ref={menu}
				id="menu"
				className="menu"
				data-open={open}
				hidden={!open}
			>
				<nav aria-label="Mobile">
					{LINKS.map((link, i) => (
						<a
							key={link.href}
							href={link.href}
							style={{ "--i": i } as React.CSSProperties}
						>
							<span lang="ja">{link.jp}</span>
							{link.label}
						</a>
					))}
				</nav>
			</div>
		</>
	);
}
