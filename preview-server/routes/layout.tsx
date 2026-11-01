import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Marine Tools',description:'Maritime calculations, connected engineering studies and a personal learning workspace.',robots:{index:false,follow:false},icons:{icon:'/assets/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
