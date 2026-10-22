import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import "lenis/dist/lenis.css";
import { Cursor } from "#/components/Cursor";
import { studio } from "#/lib/content";
import { SmoothScroll } from "#/lib/motion";
import appCss from "../styles.css?url";

const title = "ja — Tools for learning Japanese by hand";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title },
			{ name: "description", content: studio.descriptor },
			{ name: "theme-color", content: "#e9e3d3" },
			{ property: "og:title", content: title },
			{ property: "og:description", content: studio.descriptor },
			{ property: "og:type", content: "website" },
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Shippori+Mincho:wght@400;500;600;700&display=swap",
			},
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<noscript>
					<style>{".preloader{display:none}"}</style>
				</noscript>
			</head>
			<body>
				<SmoothScroll>
					{children}
					<Cursor />
				</SmoothScroll>
				<div className="grain" aria-hidden="true" />
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
