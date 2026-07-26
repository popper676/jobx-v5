import React, { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";

export interface NavItem {
  label: string;
  href: string;
}

export interface SpotlightNavbarProps {
  items: NavItem[];
  className?: string;
}

function matchesRoute(pathname: string, href: string) {
  if (href === '/' || href === '/employer') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SpotlightNavbar({ items, className = '' }: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentIdx = items.findIndex((item) => matchesRoute(location.pathname, item.href));
  
  const [activeIndex, setActiveIndex] = useState(currentIdx >= 0 ? currentIdx : 0);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [activePill, setActivePill] = useState({ left: 8, width: 96 });

  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  useEffect(() => {
    const newIdx = items.findIndex((item) => matchesRoute(location.pathname, item.href));
    if (newIdx >= 0) setActiveIndex(newIdx);
  }, [location.pathname, items]);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (activeItem) {
        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + itemRect.width / 2;
        
        animate(spotlightX.current, targetX, {
          type: "spring",
          stiffness: 200,
          damping: 20,
          onUpdate: (v) => {
            spotlightX.current = v;
            nav.style.setProperty("--spotlight-x", `${v}px`);
          }
        });
      }
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex]);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const updatePill = () => {
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
      if (!activeItem) return;
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      setActivePill({ left: itemRect.left - navRect.left, width: itemRect.width });
    };
    updatePill();
    const observer = new ResizeObserver(updatePill);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeIndex, items]);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      animate(ambienceX.current, targetX, {
        type: "spring",
        stiffness: 200,
        damping: 20,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    navigate(item.href);
  };

  return (
    <div className={`relative flex justify-center ${className} spotlight-nav-container`}>
      <nav
        ref={navRef}
        className="group relative h-12 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_35px_rgba(18,33,58,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(18,33,58,0.15)]"
      >
        <div
          className="pointer-events-none absolute top-1.5 z-[3] h-9 rounded-xl bg-[#173b67] shadow-[0_7px_18px_rgba(23,59,103,0.26)] transition-[transform,width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ width: activePill.width, transform: `translateX(${activePill.left}px)` }}
        >
          <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#b7ff3c] to-transparent opacity-90" />
        </div>
        <ul className="relative z-[10] flex h-full items-center gap-0 px-2">
          {items.map((item, idx) => (
            <li key={idx} className="relative h-full flex items-center justify-center">
              <a
                href={item.href}
                data-index={idx}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(item, idx);
                }}
                className={`relative rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7ff3c] ${
                  activeIndex === idx
                    ? "text-white"
                    : "text-slate-500 hover:-translate-y-0.5 hover:text-[#173b67]"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] opacity-0 transition-opacity duration-300"
          style={{ 
            opacity: hoverX !== null ? 1 : 0,
            background: `radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color, rgba(1, 75, 170, 0.15)) 0%, transparent 50%)`
          }}
        />

        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] z-[2]"
          style={{
            background: `radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color, #014BAA) 0%, transparent 100%)`
          }}
        />
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f3a6be]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </nav>
    </div>
  );
}
