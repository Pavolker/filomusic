# Changelog - Carrossel de Música Clássica

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.0] - 2024-12-19

### Adicionado
- ✨ Interface inicial do carrossel de música clássica
- 🎵 9 peças musicais clássicas com informações detalhadas
- 🖼️ Sistema de imagens responsivo para cada compositor
- 📱 Design responsivo para dispositivos móveis
- 🎨 Animações suaves de transição entre slides
- 🔄 Navegação automática e manual do carrossel
- 📋 Modal interativo para exibição de conteúdo detalhado
- 📄 Sistema de carregamento de arquivos Markdown
- 🌐 Compatibilidade com servidor local e arquivo direto
- 💾 Sistema de fallback para conteúdo offline
- 🎯 Detecção automática de ambiente (servidor/local)

### Características Técnicas
- HTML5 semântico
- CSS3 com animações e responsividade
- JavaScript vanilla (sem dependências externas)
- Sistema de modal dinâmico
- Carregamento inteligente de conteúdo MD
- Fallback automático para acesso local

### Conteúdo Musical
1. **1100 - Carmina Burana** (Carl Orff)
2. **1700 - Bach** (Johann Sebastian Bach)
3. **1771 - Minueto** (Wolfgang Amadeus Mozart)
4. **1822 - Ode an die Freude** (Ludwig van Beethoven)
5. **1837 - Scherzo nº2** (Frédéric Chopin)
6. **1842 - Nabuco** (Giuseppe Verdi)
7. **1869 - Richard Strauss** (Richard Strauss)
8. **1881 - Barcarolle** (Jacques Offenbach)
9. **1883 - As Flores** (Francisca Gonzaga)

### Estrutura do Projeto
```
/
├── index.html              # Página principal
├── style.css              # Estilos CSS
├── script.js              # JavaScript principal
├── arquivos md/           # Arquivos Markdown com conteúdo
├── imagens/              # Imagens dos compositores
├── deploy.sh             # Script de deploy automático
├── CHANGELOG.md          # Este arquivo
└── .gitignore           # Arquivos ignorados pelo Git
```

### Repositório
- 🔗 GitHub: https://github.com/Pavolker/musica-carrossel
- 🌐 GitHub Pages: (configurar manualmente)

---

## Como Usar o Sistema de Versionamento

### Deploy Automático
```bash
# Deploy com mensagem automática
./deploy.sh

# Deploy com mensagem personalizada
./deploy.sh "Sua mensagem de commit aqui"
```

### Comandos Git Manuais
```bash
# Verificar status
git status

# Adicionar alterações
git add .

# Fazer commit
git commit -m "Sua mensagem"

# Enviar para GitHub
git push origin main
```

---

*Mantenha este arquivo atualizado a cada nova versão do projeto.*