import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: {default:'Smart Money Book',template:'%s | Smart Money Book'},description:'ICT trading tutorials, strategy guides, PDF books, and educational resources.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
