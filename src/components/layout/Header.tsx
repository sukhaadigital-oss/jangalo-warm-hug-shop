import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
const navLinks = [{
  name: 'Novidades',
  href: '/produtos?categoria=novidades'
}, {
  name: 'Menina',
  href: '/produtos?categoria=menina'
}, {
  name: 'Menino',
  href: '/produtos?categoria=menino'
}, {
  name: 'Bebê',
  href: '/produtos?categoria=bebe'
}, {
  name: 'Essenciais',
  href: '/produtos?categoria=essenciais'
}, {
  name: 'Sale',
  href: '/produtos?categoria=sale'
}];
export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    openCart,
    totalItems
  } = useCart();
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo - centered and overlapping below header */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 z-10">
            <img src={logo} alt="Jangalô" className="h-20 md:h-32 w-auto translate-y-[25%]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.name} to={link.href} className={cn("text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", link.name === 'Sale' && "text-primary hover:text-primary/80")}>
                {link.name}
              </Link>)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => <Link key={link.name} to={link.href} className={cn("py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", link.name === 'Sale' && "text-primary hover:text-primary/80")} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>)}
            </div>
          </nav>}
      </div>
    </header>;
};