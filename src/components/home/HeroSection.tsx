import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return <section className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
        <div className="max-w-xl mx-auto text-center pt-20 md:pt-32">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6 animate-fade-in" style={{
          animationDelay: '0.1s'
        }}>
            natural como criança
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            Conforto para crescer e brincar. Cada peça é feita à mão com muito carinho.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
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
    </section>;
};
