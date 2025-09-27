# Deploy no Netlify - Filosofia da Música

## 📋 Pré-requisitos para Deploy

Esta aplicação está otimizada para deploy no Netlify com as seguintes configurações:

### ✅ Arquivos de Configuração
- `netlify.toml` - Configurações de build e headers
- `.nvmrc` - Versão do Node.js (18)
- `package.json` - Dependências e scripts de build

### 🔧 Build Process
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `.` (raiz do projeto)
- **Node Version**: 18

### 📁 Estrutura Otimizada
- Todos os caminhos são relativos
- CSS minificado via Tailwind CSS
- Headers de cache configurados
- Redirects para SPA configurados

## 🚀 Instruções de Deploy

### 1. Via Git (Recomendado)
1. Conecte seu repositório ao Netlify
2. Configure as seguintes variáveis:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.`
   - **Node version**: 18

### 2. Via Drag & Drop
1. Execute `npm run build` localmente
2. Faça upload da pasta raiz para o Netlify

### 3. Via CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir .
```

## 🔍 Verificações Pós-Deploy

- [ ] Página inicial carrega corretamente
- [ ] Filtros funcionam
- [ ] Modais de conceitos abrem
- [ ] Player do YouTube funciona
- [ ] Busca funciona
- [ ] Responsividade está ok
- [ ] Performance está otimizada

## 🛠️ Troubleshooting

### CSS não carrega
- Verifique se o build foi executado
- Confirme que `css/tailwind.css` existe

### JavaScript não funciona
- Verifique console do navegador
- Confirme que todos os arquivos JS estão presentes

### Imagens não carregam
- Verifique se os caminhos são relativos
- Confirme que as imagens estão no repositório

## 📊 Performance

- CSS minificado
- Headers de cache configurados
- Imagens otimizadas
- Lazy loading implementado