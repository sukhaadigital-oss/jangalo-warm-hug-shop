import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Jangalo Kids - Roupas artesanais infantis"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-light/80 text-olive text-sm font-medium mb-6 animate-fade-in">
            🌿 Slow Fashion Infantil
          </span>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Roupas que abraçam
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Conforto para crescer e brincar. Cada peça é feita à mão com carinho e materiais naturais.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="rounded-xl h-12 px-6">
              <Link to="/produtos">
                Ver Coleção
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl h-12 px-6">
              <Link to="/sobre">
                Nossa História
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
