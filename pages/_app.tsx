import { Provider } from 'react-redux';
import '../styles/globals.css';
import store from '../redux/store';
import { IBM_Plex_Mono, Schibsted_Grotesk } from 'next/font/google';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { hydrateSettings } from '../redux/settings';
import { loadStoredSettings, startSettingsPersistence } from '../redux/persistSettings';

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export default function MyApp({ Component, pageProps }: AppProps) {
    // Hydrate after mount so server and client markup match; then persist changes.
    useEffect(() => {
        store.dispatch(hydrateSettings(loadStoredSettings()));
        return startSettingsPersistence(store);
    }, []);

    return (
        <Provider store={store}>
            <div className={`${schibsted.variable} ${plexMono.variable} font-sans h-full`}>
                <Component {...pageProps} />
            </div>
        </Provider>
    );
}