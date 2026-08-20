import { Package, Clock, Mail, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Exclusivo e Sob Encomenda',
    description: 'Seu pedido é fabricado exclusivamente para você!',
  },
  {
    icon: Clock,
    title: 'Prazo de Postagem',
    description: 'De 1 a 4 dias úteis. Após a postagem, inicia o prazo de envio.',
  },
  {
    icon: Package,
    title: 'Slow Fashion',
    description: 'Produzimos sob demanda, diminuindo nosso impacto social e desperdício.',
  },
  {
    icon: Mail,
    title: 'Rastreio por E-mail',
    description: 'Assim que postado, você recebe o código de rastreio por e-mail!',
  },
];

export const HandmadeBanner = () => {
  return (
    <section className="bg-sand/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-light text-olive text-sm font-medium mb-4">
            📦 Informações de Envio
          </span>
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
