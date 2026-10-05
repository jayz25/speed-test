import { Provider } from 'react-redux';
import '../styles/globals.css';
import store from '../redux/store';
import { Inter, Roboto_Mono } from 'next/font/google';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { hydrateSettings } from '../redux/settings';
import { loadStoredSettings, startSettingsPersistence } from '../redux/persistSettings';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
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
            <main className={`${inter.variable} ${robotoMono.variable} font-sans h-full`}>
                <Component {...pageProps} />
            </main>
        </Provider>
    );
}