# Padrões de Trabalho  

> Documentação dos padrões, convenções e metodologias utilizadas no desenvolvimento deste projeto

## 📋 Índice

1. [Arquitetura do Projeto](#arquitetura-do-projeto)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Padrões de CSS](#padrões-de-css)
4. [Padrões de JavaScript](#padrões-de-javascript)
5. [Gestão de Conteúdo](#gestão-de-conteúdo)
6. [Debugging e Correções](#debugging-e-correções)
7. [Deploy e Configuração](#deploy-e-configuração)
8. [Metodologia de Desenvolvimento](#metodologia-de-desenvolvimento)

## 🏗️ Arquitetura do Projeto

### Princípios Fundamentais
- **Separação de Responsabilidades**: HTML para estrutura, CSS para estilo, JS para lógica
- **Modularidade**: Cada funcionalidade em arquivo separado
- **Fallback Gracioso**: Sistema funciona mesmo sem dependências externas
- **Progressive Enhancement**: Funcionalidade básica primeiro, melhorias depois

### Padrão de Arquitetura
```
Estrutura Modular com Fallback
├── Camada de Apresentação (HTML + Tailwind CSS)
├── Camada de Lógica (JavaScript Modular)
├── Camada de Dados (Local + Supabase Opcional)
└── Camada de Configuração (config.js)
```

## 📁 Estrutura de Arquivos

### Convenções de Nomenclatura
- **Arquivos principais**: `index.html`, `config.js`
- **Scripts**: Pasta `js/` com nomes descritivos (`app.js`, `md-loader.js`)
- **Conteúdo**: Arquivos `.md` com emoji identificador (`📘 Nome.md`)
- **Configuração**: Arquivos de config na raiz (`netlify.toml`, `supabase-setup.sql`)

### Organização Padrão
```
projeto/
├── index.html                 # Página principal
├── config.js                  # Configurações centralizadas
├── js/
│   ├── app.js                # Lógica principal
│   ├── [feature].js          # Funcionalidades específicas
│   └── md-loader.js          # Carregamento de conteúdo
├── 📘 [conteudo].md          # Arquivos de conteúdo
├── [deploy-config].*         # Configurações de deploy
└── README.md                 # Documentação
```

## 🎨 Padrões de CSS

### Framework e Metodologia
- **Framework**: Tailwind CSS para utilitários
- **Abordagem**: Utility-first com classes customizadas quando necessário
- **Responsividade**: Mobile-first design

### Convenções de Classes
```css
/* Cores Padrão */
.text-white          /* Texto principal */
.text-gray-300       /* Texto secundário */
.text-green-400      /* Destaque/links */

/* Layout Responsivo */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3  /* Grid responsivo */
.max-w-7xl mx-auto   /* Container centralizado */

/* Estados Interativos */
.hover:scale-105     /* Efeito hover sutil */
.transition-all      /* Transições suaves */
```

### Padrões de Modal
```css
.modal {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 1000;
}

.modal-content {
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;     /* Scroll interno */
    display: flex;
    flex-direction: column;
}
```

### Correções com !important
- **Uso**: Apenas para sobrescrever CSS externo (ex: Tailwind reset)
- **Aplicação**: Campos de input, elementos críticos
- **Exemplo**: `background-color: #1f2937 !important;`

## 💻 Padrões de JavaScript

### Estrutura Modular
```javascript
// 1. Configuração e Inicialização
let supabase = null;
let globalState = {};

// 2. Dados de Fallback
const fallbackData = [...];

// 3. Funções Principais
function loadData() {}
function renderUI() {}
function handleEvents() {}

// 4. Event Listeners
document.addEventListener('DOMContentLoaded', init);

// 5. Exports Globais
window.functionName = functionName;
```

### Convenções de Nomenclatura
- **Variáveis**: camelCase (`currentFilter`, `searchTimeout`)
- **Funções**: verbos descritivos (`loadArticles`, `renderArticles`)
- **Constantes**: UPPER_CASE (`SUPABASE_URL`)
- **Arrays**: plural (`articles`, `filteredArticles`)

### Padrão de Tratamento de Erros
```javascript
try {
    // Tentar operação principal
    const result = await primaryOperation();
} catch (error) {
    console.log('Usando fallback:', error.message);
    // Fallback gracioso
    return fallbackOperation();
}
```

### Formatação de Conteúdo
```javascript
// Padrão: Processamento linha por linha
function formatContent(content) {
    const lines = content.split('\n');
    let html = '';
    let inList = false;
    
    for (const line of lines) {
        // Processar cada linha individualmente
        // Controlar estado (listas, títulos, etc.)
    }
    
    return html;
}
```

## 📝 Gestão de Conteúdo

### Estrutura de Artigos
```javascript
const article = {
    id: number,
    title: string,
    category: string,
    description: string,
    content: string,        // Markdown
    icon: string,
    color: string,
    readingTime: string
};
```

### Categorias Padrão
- `emergencia`: Situações de emergência (vermelho/laranja)
- `prevencao`: Medidas preventivas (azul/verde)
- `eletrica`: Segurança elétrica (amarelo)
- `tecnologia`: Segurança digital (rosa)

### Formatação Markdown
- **Títulos**: `#`, `##`, `###`
- **Listas**: `- item`
- **Ênfase**: `**texto**`
- **Parágrafos**: Separados por linha vazia

## 🐛 Debugging e Correções

### Metodologia de Debug
1. **Identificar**: Reproduzir o problema consistentemente
2. **Isolar**: Encontrar a causa raiz específica
3. **Corrigir**: Implementar solução mínima necessária
4. **Testar**: Verificar correção e não-regressão

### Problemas Comuns e Soluções

#### CSS Conflitos
- **Problema**: Estilos não aplicam
- **Solução**: Usar `!important` seletivamente
- **Prevenção**: Especificidade adequada

#### Modal Overflow
- **Problema**: Conteúdo cortado
- **Solução**: `overflow-y: auto` + `flex-direction: column`
- **Complemento**: Botão sticky no topo

#### HTML Malformado
- **Problema**: Tags aparecendo como texto
- **Solução**: Processamento linha por linha vs. regex global
- **Validação**: Controle de estado para tags aninhadas

## 🚀 Deploy e Configuração

### Configuração de Desenvolvimento
```bash
# Servidor local
python3 -m http.server 8000

# URL de teste
http://localhost:8000/
```

### Deploy Netlify
```toml
# netlify.toml
[build]
  publish = "."
  command = "echo 'Static site - no build required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Configuração Supabase (Opcional)
```javascript
// Detecção automática
if (supabaseUrl && supabaseUrl !== 'placeholder' && window.supabase) {
    supabase = window.supabase.createClient(url, key);
} else {
    console.log('Modo local ativado');
}
```

## 🔄 Metodologia de Desenvolvimento

### Fluxo de Trabalho
1. **Planejamento**: Todo list para tarefas complexas
2. **Implementação**: Uma funcionalidade por vez
3. **Teste**: Preview + verificação de console
4. **Documentação**: Atualizar padrões conforme necessário

### Gestão de Tarefas
```javascript
// Estrutura de TODO
{
    id: string,
    content: string,
    status: 'pending' | 'in_progress' | 'completed',
    priority: 'high' | 'medium' | 'low'
}
```

### Critérios de Qualidade
- **Funcionalidade**: Todas as features funcionam
- **Responsividade**: Layout adapta a diferentes telas
- **Performance**: Carregamento rápido
- **Acessibilidade**: Navegação por teclado
- **Fallback**: Funciona sem dependências externas

## 🔧 Ferramentas e Dependências

### Dependências Principais
- **Tailwind CSS**: Framework de utilitários
- **Supabase** (opcional): Backend como serviço
- **Python HTTP Server**: Desenvolvimento local

### Ferramentas de Desenvolvimento
- **Cursor/VS Code**: IDE principal
- **Browser DevTools**: Debug e teste
- **Netlify**: Deploy e hosting

## 📚 Referências e Recursos

### Documentação
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [Netlify](https://docs.netlify.com/)

### Padrões de Código
- **JavaScript**: ES6+ features
- **CSS**: Utility-first approach
- **HTML**: Semantic markup

---

## 🎯 Aplicação em Novos Projetos

### Checklist de Implementação
- [ ] Estrutura de pastas modular
- [ ] Configuração centralizada
- [ ] Sistema de fallback
- [ ] CSS utility-first
- [ ] JavaScript modular
- [ ] Gestão de estado local
- [ ] Sistema de debug
- [ ] Deploy automatizado

### Adaptações Necessárias
1. **Conteúdo**: Adaptar estrutura de dados
2. **Estilo**: Ajustar cores e tipografia
3. **Funcionalidades**: Modificar features específicas
4. **Deploy**: Configurar ambiente de produção

