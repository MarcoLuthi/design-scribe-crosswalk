
import React from "react";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-6 border-t bg-background">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-muted-foreground">
        <span>Made by</span>
        <a 
          href="https://www.marcoluthi.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center hover:text-foreground transition-colors"
        >
          Marco Lüthi <ExternalLink className="ml-1 h-3 w-3" />
        </a>
        <span>for</span>
        <a 
          href="https://www.procivis.ch" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center hover:text-foreground transition-colors"
        >
          Procivis <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
