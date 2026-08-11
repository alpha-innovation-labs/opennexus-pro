import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: "Nexus | For the love of TUIs",
	description:
		"A Nexus landing page for compact, terminal-native agentic engineering workflows.",
	icons: [{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
};

/**
 * Provides global document structure, fonts, and external cast-player CSS.
 *
 * @param props Rendered Next.js route content.
 * @returns Root landing page document shell.
 */
export default function RootLayout(
	props: Readonly<{ children: React.ReactNode }>,
) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<head>
				<link rel="stylesheet" href="/asciinema/asciinema-player.css" />
			</head>
			<body className="m-0 bg-neutral-50 font-sans text-neutral-950 antialiased dark:bg-black dark:text-neutral-100">
				{props.children}
			</body>
		</html>
	);
}
