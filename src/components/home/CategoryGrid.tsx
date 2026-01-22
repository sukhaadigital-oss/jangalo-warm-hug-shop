import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

export const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
          Explore por Categoria
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Encontre a peça perfeita para cada momento da infância
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={`/produtos?categoria=${category.slug}`}
            className="group text-center animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="category-circle aspect-square mb-4 mx-auto max-w-[200px]">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-serif text-lg font-medium group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};
