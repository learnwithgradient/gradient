import type { Metadata } from "next";
import Navbar from "@/src/components/Navbar";
import "@/src/components/Navbar.css";

export const metadata: Metadata = {
  title: "Gradient",
  description: "Machine Learning made visual.",
  keywords:
    "Gradient, learn data science, learn ai, learn machine learning, machine learning, data science, AI education, open-source education platform",
  authors: [{ name: "Gradient" }],
  applicationName: "Gradient",
  robots: "index, follow",
  icons: {
    icon: "/icons/logo.svg",
  },
  openGraph: {
    siteName: "Gradient",
    type: "website",
    locale: "en_US",
    title: "Gradient",
    description: "Machine Learning made visual.",
    url: "https://aryan-cs.github.io/gradient/",
    images: [
      {
        url: "https://aryan-cs.github.io/gradient/assets/images/welcome.png",
        width: 2998,
        height: 1558,
        alt: "Welcome to Gradient",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradient",
    description: "Machine Learning made visual.",
    images: [
      "https://aryan-cs.github.io/gradient/assets/images/welcome.png",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f7f3ea" />
        <link rel="canonical" href="https://aryan-cs.github.io/gradient/" />
      </head>
      <body>
        <div id="root">
          <Navbar>{children}</Navbar>
        </div>
      </body>
    </html>
  );
}
