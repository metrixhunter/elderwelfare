import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* ✅ Uses favicon.ico instead of PNG */}
        <link rel="icon" href="/logo/favicon.ico" />

        {/* ✅ Changes tab title to "Finedge" */}
        <title>Finedge</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}




