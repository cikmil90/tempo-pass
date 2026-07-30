import "./styles.css";

export const metadata = {
  title: "Tempo Pass",
  description: "Register and redeem your Tempo prize pass.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
