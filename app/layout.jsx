import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://learnwithgradient.com"),
  title: {
    default: "Gradient | Visual Machine Learning Lessons",
    template: "%s | Gradient",
  },
  description:
    "Learn machine learning visually with interactive AI lessons, intuitive explanations, and Scratch-inspired experiments.",
  icons: {
    icon: "/icons/logo.svg",
    shortcut: "/icons/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
