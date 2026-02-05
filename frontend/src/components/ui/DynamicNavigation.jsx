import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export const DynamicNavigation = ({
  links,
  backgroundColor,
  textColor,
  highlightColor,
  glowIntensity = 5,
  className,
  showLabelsOnMobile = false,
  onLinkClick,
  activeLink,
  enableRipple = true,
}) => {
  const navRef = useRef(null);
  const highlightRef = useRef(null);
  const [active, setActive] = useState(
    activeLink || (links && links.length > 0 ? links[0].id : null)
  );

  // Default styles with translucency
  const defaultThemeStyles = {
    bg: backgroundColor || "bg-white/10 dark:bg-black/20 backdrop-blur-md",
    border: "border border-white/20 dark:border-white/10",
    text: textColor || "text-gray-900 dark:text-gray-100",
    highlight: highlightColor || "bg-black/5 dark:bg-white/10",
    glow: `shadow-[0_0_${glowIntensity}px_rgba(255,255,255,0.1)]`,
  };

  // Update highlight position based on active link
  const updateHighlightPosition = (id) => {
    if (!navRef.current || !highlightRef.current) return;

    const currentId = id || active;
    if (!currentId) return;

    const linkElement = navRef.current.querySelector(
      `#nav-item-${currentId}`
    );
    if (!linkElement) return;

    const { left, width } = linkElement.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();

    highlightRef.current.style.transform = `translateX(${
      left - navRect.left
    }px)`;
    highlightRef.current.style.width = `${width}px`;
  };

  // Create ripple effect
  const createRipple = (event) => {
    if (!enableRipple) return;

    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add(
      "absolute",
      "bg-current", // use current text color for ripple
      "rounded-full",
      "pointer-events-none",
      "opacity-20",
      "animate-ripple"
    );

    const existingRipple = button.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  // Handle link click
  const handleLinkClick = (id, event) => {
    if (enableRipple) {
      createRipple(event);
    }
    setActive(id);
    if (onLinkClick) {
      onLinkClick(id);
    }
  };

  // Handle link hover
  const handleLinkHover = (id) => {
    if (!navRef.current || !highlightRef.current) return;
    updateHighlightPosition(id);
  };

  // Set initial highlight position and update on window resize
  useEffect(() => {
    updateHighlightPosition();

    const handleResize = () => {
      updateHighlightPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [active, links]);

  // Update when active link changes externally
  useEffect(() => {
    if (activeLink && activeLink !== active) {
      setActive(activeLink);
    }
  }, [activeLink]);

  if (!links || links.length === 0) return null;

  return (
    <nav
      ref={navRef}
      className={cn(
        `relative rounded-full transition-all duration-300`,
        defaultThemeStyles.bg,
        defaultThemeStyles.border,
        defaultThemeStyles.glow,
        className
      )}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      {/* Background highlight */}
      <div
        ref={highlightRef}
        className={cn(
          `absolute top-1 left-0 h-[calc(100%-8px)] my-1 rounded-full transition-all 
          duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-0`,
          defaultThemeStyles.highlight
        )}
        style={{
          backgroundColor: highlightColor,
        }}
      ></div>

      <ul className="flex justify-between items-center gap-1 py-1 px-1 relative z-10 m-0 list-none">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex-1 rounded-full"
            id={`nav-item-${link.id}`}
          >
            <a
              href={link.href}
              className={cn(
                `flex gap-2 items-center justify-center h-10 px-4 text-sm 
                rounded-full font-medium transition-all duration-300 
                relative overflow-hidden cursor-pointer select-none no-underline`,
                defaultThemeStyles.text,
                active === link.id && "font-semibold"
              )}
              onClick={(e) => {
                // Don't prevent default - allow anchor navigation
                handleLinkClick(link.id, e);
              }}
              onMouseEnter={() => handleLinkHover(link.id)}
            >
              {link.icon && (
                <span className="text-current text-lg relative z-10 w-5 h-5 flex items-center justify-center">
                  {link.icon}
                </span>
              )}
              <span
                className={cn("relative z-10", showLabelsOnMobile ? "flex" : "hidden sm:flex")}
              >
                {link.label}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s linear;
        }
`,
        }}
      />
    </nav>
  );
};

export default DynamicNavigation;
