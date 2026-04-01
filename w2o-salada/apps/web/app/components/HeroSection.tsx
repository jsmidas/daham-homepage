export default function HeroSection() {
  return (
    <section id="hero" className="relative w-full bg-brand-dark">
      <div className="aspect-video">
        <video
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
