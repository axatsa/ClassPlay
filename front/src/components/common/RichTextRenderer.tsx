import React from "react";

interface RichTextRendererProps {
  text: string;
  className?: string;
}

/**
 * RichTextRenderer parses special notations in AI-generated text:
 * 1. [FRAC:numerator:denominator] -> Visual fraction with a line
 * 2. x^2 -> Superscript exponents
 * 3. * -> × (multiplication sign)
 * 4. / -> ÷ (division sign, if not part of a fraction notation or URL)
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ text, className = "" }) => {
  if (!text) return null;

  // First, handle fractions [FRAC:N:D]
  // We'll split the text by the fraction pattern
  const fracRegex = /\[FRAC:([^:]+):([^\]]+)\]/g;
  
  const processExponents = (str: string) => {
    // Matches standard exponents like x^2 or complex ones with parentheses like (x+1)^2
    const parts = str.split(/((?:[a-zA-Z0-9]|\([^)]+\))\^\d+)/g);
    return parts.map((part, i) => {
      const match = part.match(/^((?:[a-zA-Z0-9]|\([^)]+\)))\^(\d+)$/);
      if (match) {
        return <React.Fragment key={`sup-frag-${i}`}>{match[1]}<sup key={`sup-${i}`}>{match[2]}</sup></React.Fragment>;
      }
      // Replace * with × and / with ÷ (if it's a simple division like 10 / 2 or 10/2)
      let formatted = part.replace(/\*/g, "×");
      // Only replace / if it looks like a division (digits/digits or spaces around it)
      // to avoid breaking URLs or dates
      formatted = formatted.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 ÷ $2");
      formatted = formatted.replace(/\s\/\s/g, " ÷ ");
      
      return formatted;
    });
  };

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = fracRegex.exec(text)) !== null) {
    // Add text before the fraction
    if (match.index > lastIndex) {
      parts.push(processExponents(text.substring(lastIndex, match.index)));
    }

    // Add the fraction
    const [_, num, den] = match;
    parts.push(
      <span key={`frac-${match.index}`} className="math-fraction">
        <span className="math-num">{num}</span>
        <span className="math-den">{den}</span>
      </span>
    );

    lastIndex = fracRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(processExponents(text.substring(lastIndex)));
  }

  return <span className={`rich-text-renderer ${className}`}>{parts}</span>;
};
