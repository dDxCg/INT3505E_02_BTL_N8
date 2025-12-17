import { useState, useEffect } from 'react';
import logoImage from '../../assets/images/logo.png';
import butterChicken from '../../assets/images/butter-chicken-4.jpg';
import biryani from '../../assets/images/hyderabadibiryani.jpg';
import paneerTika from '../../assets/images/paneer-tika.webp';
import masalaDosa from '../../assets/images/masala-dosa.jpg';
import roganJosh from '../../assets/images/rogan-josh.jpg';
import saagPaneer from '../../assets/images/Saag-Paneer-1.jpg';

export default function GuestDisplayPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Food images from your assets directory
  const foodImages = [
    butterChicken,
    biryani,
    paneerTika,
    masalaDosa,
    roganJosh,
    saagPaneer,
  ];

  // Auto-advance slideshow every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % foodImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [foodImages.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-amber-50">
      {/* Background Slideshow with Ken Burns Effect */}
      <div className="absolute inset-0">
        {foodImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Image with slow zoom animation */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${image})`,
                animation: index === currentSlide ? 'kenBurns 12s ease-in-out infinite alternate' : 'none',
              }}
            />

            {/* Dark overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

            {/* Warm amber overlay for cohesive tone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-900/30 via-transparent to-amber-900/20" />
          </div>
        ))}
      </div>

      {/* Decorative Texture Overlay */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 lg:p-16">

        {/* Center Section: Welcome Message */}
        <div className="max-w-4xl text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img
              src={logoImage}
              alt="Restro 8 Logo"
              className="h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Main Heading */}
          <h1
            className="- -translate-y-4 bottom-50 text-6xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-none drop-shadow-2xl"
            style={{
              fontFamily: "'Be Vietnam Pro', 'Quicksand', sans-serif",
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(251,146,60,0.3)'
            }}
          >
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300">
              Restro 8
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="text-2xl lg:text-3xl text-amber-100 mb-8 font-light leading-relaxed drop-shadow-lg max-w-2xl mx-auto"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            Where every meal tells a story, and every flavor feels like home.
            Experience comfort food crafted with love and tradition.
          </p>

        
        </div>

        {/* Bottom Section: Slideshow Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          {foodImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'w-12 h-3 bg-orange-400 shadow-lg'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="text-orange-300">
          <path
            d="M0,0 L100,0 L100,20 C80,20 60,40 60,60 C40,60 20,80 20,100 L0,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none rotate-180">
        <svg viewBox="0 0 100 100" className="text-amber-300">
          <path
            d="M0,0 L100,0 L100,20 C80,20 60,40 60,60 C40,60 20,80 20,100 L0,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Custom Animations & Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&family=Quicksand:wght@400;500;600;700&display=swap');

        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.15) translate(-2%, -2%);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 1s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
        }

        /* Hide scrollbars */
        body {
          overflow: hidden;
        }

        /* Smooth text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
