import Head from "next/head";
import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */

function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default App;
