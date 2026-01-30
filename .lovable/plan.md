
## Plano: Logo Sobreposta ao Header

### Objetivo
Posicionar a logo para que ela fique parcialmente dentro do header e parcialmente sobreposta ao conteúdo abaixo, criando um efeito visual elegante como na imagem de referência.

### Técnica
Usar `transform: translateY()` para empurrar a logo para baixo, fazendo com que ela "transborde" o limite inferior do header.

### Alterações

**Arquivo: `src/components/layout/Header.tsx`**

1. **Remover `overflow: hidden`** do header (se houver) para permitir que a logo apareça fora dos limites

2. **Posicionar a logo com transform**:
   - Adicionar `translate-y-1/2` ou valor similar para empurrar metade da logo para baixo
   - Adicionar `relative z-10` para garantir que a logo fique acima do conteúdo

3. **Ajustar tamanhos**:
   | Elemento | Atual | Novo |
   |----------|-------|------|
   | Altura do Header | `h-20 md:h-28` | `h-16 md:h-20` |
   | Tamanho da Logo | `h-16 md:h-24` | `h-24 md:h-36` |
   | Logo Position | - | `absolute` + `translate-y-[30%]` |

4. **Estrutura do container da logo**:
   - Usar posicionamento absoluto com `left-1/2 -translate-x-1/2` para centralizar
   - Ou manter relativo mas com transform vertical

### Resultado Esperado
- Logo grande e proeminente
- Metade da logo dentro do header, metade sobreposta ao conteúdo abaixo
- Visual sofisticado e moderno similar à referência
- Navegação e ícones permanecem funcionais e bem posicionados
