import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/okyi/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/okyi/favicon-16x16.png"
        />
        <link rel="icon" href="/okyi/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/okyi/favicon-32x32.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
