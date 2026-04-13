import { Provider } from 'react-redux';
import '../styles/globals.css';
import store from '../redux/store';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function MyApp({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <main className={`${inter.variable} font-sans h-full`}>
                <Component {...pageProps} />
            </main>
        </Provider>
    );
}