import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HandmadeBanner } from '@/components/home/HandmadeBanner';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header logoOverlap />

      <main className="pt-16 md:pt-20">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
        <HandmadeBanner />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
