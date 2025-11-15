import React, { useEffect, useState } from 'react'

export default function wakeBackend({ children }: { children: React.ReactNode }){
    const [ready, setReady] = useState(false);
    useEffect(() => {
        async function wake() {
            try {
                await fetch(`$process.env.NEXT_PUBLIC_SERVER_URL}/api/health`, {
                    cache: "no-store",
                });
            } catch (err) {
                console.log("Backend Waking Up...");
            }
            finally {
                setReady(true);
            }
        }
        wake();
    }, []);

    if (!ready) {
        return (
            <div className="flex items-center justify-center h-screen text-lg">
                ⚡ Waking up backend…
            </div>
            );
    };

    return <>{children}</>
}

