import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"SunsetQuorum",description:"Consumer-safe API deprecation gate on GenLayer"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
