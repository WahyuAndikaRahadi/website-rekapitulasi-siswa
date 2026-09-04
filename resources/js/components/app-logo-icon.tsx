import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt = 'Logo SMKN 69 Jakarta', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            alt={alt}
            className={`object-contain ${className ?? ''}`}
            {...props}
        />
    );
}

