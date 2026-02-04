// import Breadcrumbs from '@/components/elements/Breadcrumbs/Breadcrumbs'
import React from "react";

export default function ServicesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            {/* <Breadcrumbs /> */}
            <main>{children}</main>
        </div>
    );
}
