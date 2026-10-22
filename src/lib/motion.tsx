import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

/*
 * The preloader resolves this once its curtain lifts, so sections can hold
 * their entrance animations until the page is actually visible.
 */
let introDone = false;
const introListeners = new Set<() => void>();

export function finishIntro() {
	introDone = true;
	// Deferred so listeners don't run inside the preloader's gsap.context,
	// which would scope their selectors to the preloader element.
	queueMicrotask(() => {
		for (const listener of introListeners) listener();
		introListeners.clear();
	});
}

export function onIntro(listener: () => void) {
	if (introDone) {
		listener();
		return () => {};
	}
	introListeners.add(listener);
	return () => introListeners.delete(listener);
}

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
	return useContext(LenisContext);
}

export function scrollToTarget(lenis: Lenis | null, target: string | number) {
	if (lenis) {
		lenis.scrollTo(target, { duration: 1.6 });
		return;
	}
	if (typeof target === "number") {
		window.scrollTo({ top: target });
	} else {
		document.querySelector(target)?.scrollIntoView();
	}
}

export function SmoothScroll({ children }: { children: ReactNode }) {
	const [lenis, setLenis] = useState<Lenis | null>(null);

	useEffect(() => {
		const instance = new Lenis({
			autoRaf: false,
			lerp: 0.085,
			anchors: { duration: 1.6 },
		});
		instance.on("scroll", ScrollTrigger.update);

		const tick = (time: number) => instance.raf(time * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
		setLenis(instance);

		return () => {
			gsap.ticker.remove(tick);
			instance.destroy();
			setLenis(null);
		};
	}, []);

	return (
		<LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
	);
}
