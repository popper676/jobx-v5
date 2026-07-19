import React, { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedHeading({ text, className = '', style = {} }: AnimatedHeadingProps) {
  const [startAnimation, setStartAnimation] = useState(false);
  const charDelay = 30; // 30ms per character
  const initialDelay = 200; // 200ms before starting
  const transitionDuration = 500; // 500ms for each character

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  // Split by literal \n
  const lines = text.split('\n');

  return (
    <div className={className} style={style}>
      {lines.map((line, lineIndex) => {
        // Calculate how many characters were in the previous lines to properly stagger multi-line text
        // The prompt asked for: (lineIndex * lineLength * charDelay) + (charIndex * charDelay)
        // Let's interpret lineLength as the length of the *previous* lines for continuous staggering,
        // or just literally (lineIndex * line.length * charDelay) if they want a rough estimate.
        // Actually, a more precise staggering is keeping a running total of characters:
        const prevChars = lines.slice(0, lineIndex).join('').length;

        return (
          <div key={lineIndex} className="block">
            {line.split('').map((char, charIndex) => {
              // Calculate delay based on global character index
              const globalCharIndex = prevChars + charIndex;
              const delay = globalCharIndex * charDelay;
              
              return (
                <span
                  key={charIndex}
                  className="inline-block"
                  style={{
                    opacity: startAnimation ? 1 : 0,
                    transform: startAnimation ? 'translateX(0px)' : 'translateX(-18px)',
                    transition: `opacity ${transitionDuration}ms ease-out, transform ${transitionDuration}ms ease-out`,
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
