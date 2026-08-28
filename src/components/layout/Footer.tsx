import { Link } from 'react-router-dom';
import { Instagram, Mail, Heart } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/">
              <img src={logo} alt="Jangalô" className="h-24 w-auto mb-4" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Roupas que abraçam: feitas à mão com amor e carinho para os pequenos.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://instagram.com/jangalokids"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:contato@jangalokids.com.br"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium mb-4">Loja</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/produtos?categoria=novidades" className="hover:text-foreground transition-colors">Novidades</Link></li>
              <li><Link to="/produtos?categoria=menina" className="hover:text-foreground transition-colors">Menina</Link></li>
              <li><Link to="/produtos?categoria=menino" className="hover:text-foreground transition-colors">Menino</Link></li>
              <li><Link to="/produtos?categoria=bebe" className="hover:text-foreground transition-colors">Bebê</Link></li>
            </ul>
          </div>

          {/* Handmade Badge */}
          <div>
            <div className="bg-olive-light/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-olive" />
                <span className="text-sm font-medium text-olive">Slow Fashion</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Produção lenta e consciente: cada peça é feita à mão após o seu pedido.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Jangalo Kids. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
