import { FC } from "react";

interface CatalogIconProps {
    className?: string;
}

export const CatalogIcon: FC<CatalogIconProps> = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
