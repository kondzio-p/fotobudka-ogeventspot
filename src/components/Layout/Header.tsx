import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGSAP } from '../../hooks/useGSAP';

interface HeaderProps {
  data?: {
    facebookUrl?: string;
    instagramUrl?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ data }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const gsap = useGSAP();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (!gsap) {
      // Fallback to native smooth scroll
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const target = document.querySelector(targetId);
    if (target) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: {
          y: target,
          offsetY: 80
        },
        ease: "power2.inOut"
      });
    }
  };
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const facebookUrl = data?.facebookUrl || "https://www.facebook.com/profile.php?id=61553668165091";
  const instagramUrl = data?.instagramUrl || "https://www.instagram.com/og.eventspot/";

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Desktop Layout */}
        <div className="logo d-none d-md-block">
          <img
            src="/assets/main/images/og-events-logo-white.png"
            alt="OG Events Logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.outerHTML = '<div style="color: #8b4b7a; font-weight: bold; font-size: 24px;">OG<br><span style="font-size: 12px; font-weight: normal;">EVENT SPOT</span></div>';
            }}
          />
        </div>

        <nav className="d-none d-md-block">
          <ul className="nav-menu">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Strona główna
              </Link>
            </li>
            <li>
              <a href="#welcome" onClick={(e) => handleSmoothScroll(e, '#welcome')}>O nas</a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Kontakt</a>
            </li>
          </ul>
        </nav>

        <div className="social-icons d-none d-md-flex">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon facebook"
            aria-label="Facebook"
          >
            <img src="/assets/main/images/fb.svg" width="20px" alt="" />
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon instagram"
            aria-label="Instagram"
          >
            <img src="/assets/main/images/insta.svg" width="25px" alt="" />
          </a>
        </div>

        {/* Mobile Layout */}
        <div className="d-md-none w-100">
          <div className="header-top-row">
            <div className="logo">
              <img
                src="/assets/main/images/og-events-logo-white.png"
                alt="OG Events Logo"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<div style="color: #8b4b7a; font-weight: bold; font-size: 18px;">OG<br><span style="font-size: 10px; font-weight: normal;">EVENT SPOT</span></div>';
                }}
              />
            </div>

            <div className="social-icons">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <img src="/assets/main/images/fb.svg" width="16px" alt="" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <img src="/assets/main/images/insta.svg" width="18px" alt="" />
              </a>
            </div>
          </div>

          <nav>
            <ul className="nav-menu">
              <li>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  Główna
                </Link>
              </li>
              <li>
                <a href="#welcome" onClick={(e) => handleSmoothScroll(e, '#welcome')}>O nas</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Kontakt</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;