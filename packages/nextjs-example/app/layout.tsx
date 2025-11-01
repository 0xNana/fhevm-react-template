import "@rainbow-me/rainbowkit/styles.css";
import { DappWrapperWithProviders } from "~~/components/DappWrapperWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/helper/getMetadata";

export const metadata = getMetadata({
  title: "Next.js Example",
  description: "Next.js example application for Universal FHEVM SDK",
});

const DappWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=telegraf@400,500,700&display=swap"
          rel="stylesheet"
        />
        {/* Intercept fetch to proxy WASM requests through our domain to bypass CORS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalFetch = window.fetch;
                window.fetch = function(input, init) {
                  let url = input;
                  let request = null;
                  
                  // Handle Request object
                  if (input instanceof Request) {
                    url = input.url;
                    request = input;
                  } else if (typeof input === 'string') {
                    url = input;
                  }
                  
                  // Rewrite CDN URLs to use our proxy (relative URL)
                  // Support both .org (official) and .ai (legacy) domains
                  if (typeof url === 'string' && (url.includes('cdn.zama.org/relayer-sdk-js') || url.includes('cdn.zama.ai/relayer-sdk-js'))) {
                    const proxyUrl = url.replace(/https:\/\/cdn\.zama\.(org|ai)/, '');
                    console.log('[FHEVM Proxy] Rewriting:', url, '->', proxyUrl);
                    
                    if (request) {
                      // Create new Request with proxied URL
                      return originalFetch.call(this, new Request(proxyUrl, request), init);
                    }
                    return originalFetch.call(this, proxyUrl, init || {});
                  }
                  
                  return originalFetch.call(this, input, init);
                };
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <DappWrapperWithProviders>{children}</DappWrapperWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default DappWrapper;
