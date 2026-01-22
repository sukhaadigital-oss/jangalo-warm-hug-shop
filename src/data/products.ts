import { Product, Category } from '@/types/product';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import categoryMenina from '@/assets/category-menina.jpg';
import categoryMenino from '@/assets/category-menino.jpg';
import categoryBebe from '@/assets/category-bebe.jpg';
import categoryEssenciais from '@/assets/category-essenciais.jpg';

export const categories: Category[] = [
  { id: '1', name: 'Menina', slug: 'menina', image: categoryMenina },
  { id: '2', name: 'Menino', slug: 'menino', image: categoryMenino },
  { id: '3', name: 'Bebê', slug: 'bebe', image: categoryBebe },
  { id: '4', name: 'Essenciais', slug: 'essenciais', image: categoryEssenciais },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vestido Terracota Manga Bufante',
    price: 189.90,
    description: 'Vestido delicado em algodão orgânico com mangas bufantes. Perfeito para dias ensolarados e momentos especiais.',
    category: 'menina',
    sizes: ['P', '1', '2', '3', '4', '6', '8', '10'],
    images: [product1],
    productionDays: 7,
    stock: 12,
    isNew: true,
  },
  {
    id: '2',
    name: 'Jardineira Oliva Linho',
    price: 159.90,
    description: 'Jardineira confortável em linho natural. Ideal para brincadeiras e aventuras do dia a dia.',
    category: 'menino',
    sizes: ['P', '1', '2', '3', '4', '6'],
    images: [product2],
    productionDays: 5,
    stock: 8,
    isNew: true,
  },
  {
    id: '3',
    name: 'Romper Creme Algodão',
    price: 129.90,
    description: 'Romper suave em algodão pima. Conforto absoluto para os pequeninos.',
    category: 'bebe',
    sizes: ['RN', 'P', 'M', 'G'],
    images: [product3],
    productionDays: 4,
    stock: 15,
  },
  {
    id: '4',
    name: 'Blusa Bordada Natural',
    price: 119.90,
    originalPrice: 149.90,
    description: 'Blusa delicada com bordado artesanal. Cada peça é única e feita com amor.',
    category: 'menina',
    sizes: ['1', '2', '3', '4', '6', '8'],
    images: [product4],
    productionDays: 10,
    stock: 5,
    isSale: true,
  },
  {
    id: '5',
    name: 'Conjunto Essencial Bebê',
    price: 199.90,
    description: 'Kit com body, calça e touca em algodão orgânico. Essenciais para o enxoval.',
    category: 'essenciais',
    sizes: ['RN', 'P', 'M', 'G'],
    images: [categoryEssenciais],
    productionDays: 6,
    stock: 10,
  },
  {
    id: '6',
    name: 'Camisa Linho Bege',
    price: 109.90,
    description: 'Camisa clássica em linho natural. Elegância e conforto para ocasiões especiais.',
    category: 'menino',
    sizes: ['1', '2', '3', '4', '6', '8', '10'],
    images: [categoryMenino],
    productionDays: 5,
    stock: 7,
  },
];
