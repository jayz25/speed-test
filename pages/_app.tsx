import { Provider } from 'react-redux';
import '../styles/globals.css';
import store from '../redux/store';
import { Inter, Roboto_Mono } from 'next/font/google';
import type { AppProps } from 'next/app';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <main className={`${inter.variable} ${robotoMono.variable} font-sans h-full`}>
                <Component {...pageProps} />
            </main>
        </Provider>
    );
}