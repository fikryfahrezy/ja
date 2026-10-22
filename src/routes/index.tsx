import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "#/components/Footer";
import { Hero } from "#/components/Hero";
import { Manifesto } from "#/components/Manifesto";
import { Marquee } from "#/components/Marquee";
import { Method } from "#/components/Method";
import { Nav } from "#/components/Nav";
import { Practice } from "#/components/Practice";
import { Preloader } from "#/components/Preloader";
import { Products } from "#/components/Products";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<>
			<Preloader />
			<Nav />
			<main>
				<Hero />
				<Manifesto />
				<Products />
				<Method />
				<Marquee />
				<Practice />
			</main>
			<Footer />
		</>
	);
}
