import React from 'react';

const Footer = () => (
  <footer className="bg-secondary text-text-secondary py-8">
    <div className="container mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} TypeForge. All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-4">
        <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
      </div>
    </div>
  </footer>
);

export default Footer;
