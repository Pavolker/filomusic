# Filosofia da Música - Versão 2.0

## 🎯 Objetivo
Evoluir a aplicação "Filosofia da Música" com um dial interativo, player do YouTube e 200 textos em formato markdown, mantendo independência total da versão 1.0.

## 📋 Status do Projeto
- ✅ Base estática construída em HTML/CSS/JS
- ✅ Dados e textos gerados automaticamente via script Node
- ⏳ Ajustes visuais e testes cross-browser em andamento

## 🚀 Tecnologias
- HTML5 + Tailwind CSS pré-compilado
- JavaScript vanilla (ES2020) para UI, dial e integração com a YouTube IFrame API
- Node.js para automação (`scripts/build-content.js`)
- Conteúdo fonte em `MUSICA_9.csv`, `arquivo md/` e `conceitos/`

## 📁 Estrutura
- `index.html` — layout principal e pontos de montagem da aplicação
- `js/` — módulos com dados compilados (`data.js`, `markdown-content.js`, `youtube-data.js`) e lógica (dial, player, citações)
- `css/` — estilos customizados do dial e sobreposições ao Tailwind
- `scripts/` — automações para regenerar dados a partir das fontes originais
- `arquivo md/`, `conceitos/` — textos em markdown utilizados pelo modal

## 🎨 Funcionalidades
- Dial temporal com 200 marcas e destaque por período histórico
- Player YouTube invisível com cache local, detecção offline e mensagens de status
- Modal que converte markdown para HTML com fallback informativo
- Citações carregadas de `citacoes.md` com fallback embutido

## 🔧 Fluxo de Trabalho
1. **Gerar dados**: `node scripts/build-content.js`
   - Regenera `js/data.js`, `js/markdown-content.js` e `js/youtube-data.js`
   - Exibe avisos sobre músicas sem URL mapeada (esperado enquanto o dataset estiver incompleto)
2. **Servir localmente** (necessário para carregar markdown/youtube via `fetch`):
   - `npx http-server .` ou `python3 -m http.server 8000`
   - Abrir `http://localhost:8080` (ou a porta informada)
3. **Validar**: mover o dial, abrir textos, reproduzir e pausar músicas, forçar modo offline (desconecte a rede) e voltar

## ✅ Checklist de Verificação
- `scripts/build-content.js` executa sem erros e atualiza arquivos em `js/`
- Fallbacks visuais aparecem quando dados não carregam (`dial-error-banner`, `playerStatus`, `quote-fallback`)
- Botões `Reproduzir`/`Parar` são desabilitados automaticamente quando sem conexão
- Citações carregam de `citacoes.md`; ao renomear o arquivo, o fallback embutido é exibido
- Slider responde bem em telas menores (polegar reduzido via media queries)

## 📝 Notas
- As chaves em `js/youtube-data.js` ainda não cobrem todas as 200 músicas; o script de build reporta a quantidade de playlists ausentes para facilitar a manutenção
- Evite editar manualmente os arquivos gerados. Sempre rode `node scripts/build-content.js` após alterar CSV/markdown/JSON
