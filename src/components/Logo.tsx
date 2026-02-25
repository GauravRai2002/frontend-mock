import Image from 'next/image'

interface LogoProps {
    size?: number
    className?: string
}

/**
 * MockBird logo image component.
 * Uses the logo.png placed in /public.
 */
const Logo = ({ size = 28, className = '' }: LogoProps) => {
    return (
        <Image
            src="/logo.png"
            alt="MockBird logo"
            width={size}
            height={size}
            className={className}
            priority
        />
    )
}

export default Logo
