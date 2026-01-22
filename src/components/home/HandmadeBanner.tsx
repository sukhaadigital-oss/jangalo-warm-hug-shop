import { Leaf, Heart, Clock, Recycle } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Feito com Amor',
    description: 'Cada costura é feita à mão com cuidado e atenção aos detalhes.',
  },
  {
    icon: Clock,
    title: 'Produção sob Encomenda',
    description: 'Produzimos após seu pedido, evitando desperdício.',
  },
  {
    icon: Leaf,
    title: 'Materiais Naturais',
    description: 'Algodão orgânico, linho e tecidos que respeitam a pele.',
  },
  {
    icon: Recycle,
    title: 'Moda Consciente',
    description: 'Peças duráveis que podem ser passadas adiante.',
  },
];

export const HandmadeBanner = () => {
  return (
    <section className="bg-sand/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-light text-olive text-sm font-medium mb-4">
            🌿 Slow Fashion
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Produção Lenta e Consciente
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Cada peça é feita à mão após o seu pedido, com materiais naturais e muito carinho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-background rounded-2xl p-6 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-terracotta-light/30 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
