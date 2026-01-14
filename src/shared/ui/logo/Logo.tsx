import Link from "next/link";
import styles from "./Logo.module.scss";
import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link className={`${styles.wrapper} ${className}`} href="/">
      <Image src={"/logo-full-black.svg"} alt="logo" width={300} height={100} />
    </Link>
  );
}
