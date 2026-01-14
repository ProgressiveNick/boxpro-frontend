import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function FullLogo() {
  return (
    <Link className="fulllogo-container" href="/">
      <Image src={"/logo-full-white.svg"} alt="logo" width={180} height={80} />
    </Link>
  );
}
