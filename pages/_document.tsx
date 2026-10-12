import { Head, Html, Main, NextScript } from "next/document";
import { THEME_INIT_SCRIPT } from "../utils/theme";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Applies a stored explicit theme before first paint to avoid a light/dark flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
