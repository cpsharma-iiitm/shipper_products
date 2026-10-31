import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router-dom'
const SITE_NAME = 'Shipper.com'
/** Top-level route element: sets the document title from route `handle.title` and restores scroll. */
export default function RootRoute() {
    const matches = useMatches()
    const title = [...matches].reverse().find((match) => match.handle?.title)?.handle.title
    useEffect(() => {
        document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    }, [title])
    return (
        <>
            <Outlet />
            <ScrollRestoration />
        </>
    )
}