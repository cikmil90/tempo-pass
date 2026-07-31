import "./styles.css";

export const metadata = {
  title: "Tempo Pass × CULT 2Y",
  description: "Reveal and register your Tempo prize pass from CULT's second anniversary.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
