# 📋 Guia de Versionamento - Carrossel de Música

## 🎯 Objetivo
Este documento garante que todas as versões e alterações do projeto sejam adequadamente versionadas no GitHub.

## 🚀 Deploy Rápido

### Método 1: Script Automático (Recomendado)
```bash
# Deploy com timestamp automático
./deploy.sh

# Deploy com mensagem personalizada
./deploy.sh "Adiciona nova funcionalidade X"
```

### Método 2: Comandos Git Manuais
```bash
git add .
git commit -m "Descrição das alterações"
git push origin main
```

## 📝 Convenções de Commit

### Tipos de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `style:` Alterações de estilo/formatação
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Tarefas de manutenção

### Exemplos
```bash
git commit -m "feat: adiciona modal para exibição de conteúdo MD"
git commit -m "fix: corrige carregamento de arquivos em ambiente local"
git commit -m "docs: atualiza documentação do projeto"
git commit -m "style: melhora responsividade do carrossel"
```

## 🔄 Fluxo de Trabalho

### Antes de Fazer Alterações
1. Verificar status: `git status`
2. Verificar branch: `git branch`
3. Atualizar repositório: `git pull origin main`

### Após Fazer Alterações
1. Verificar alterações: `git status`
2. Adicionar arquivos: `git add .`
3. Fazer commit: `git commit -m "mensagem"`
4. Enviar para GitHub: `git push origin main`

### Ou Simplesmente
```bash
./deploy.sh "Descrição das alterações"
```

## 📊 Monitoramento

### Verificar Histórico
```bash
git log --oneline -10  # Últimos 10 commits
git log --graph --oneline  # Visualização gráfica
```

### Verificar Diferenças
```bash
git diff  # Alterações não commitadas
git diff HEAD~1  # Comparar com commit anterior
```

## 🌐 Links Importantes

- **Repositório GitHub**: https://github.com/Pavolker/musica-carrossel
- **GitHub Pages**: (configurar em Settings > Pages)
- **Issues**: https://github.com/Pavolker/musica-carrossel/issues

## ⚠️ Importante

### Sempre Versionar
- ✅ Alterações no código (HTML, CSS, JS)
- ✅ Novos arquivos de conteúdo (MD)
- ✅ Alterações nas imagens
- ✅ Atualizações na documentação
- ✅ Correções de bugs
- ✅ Novas funcionalidades

### Nunca Versionar
- ❌ Arquivos temporários (.DS_Store)
- ❌ Logs de desenvolvimento
- ❌ Arquivos de configuração local
- ❌ Backups temporários

## 🔧 Solução de Problemas

### Se o Push Falhar
```bash
git pull origin main  # Atualizar primeiro
git push origin main  # Tentar novamente
```

### Se Houver Conflitos
```bash
git status  # Ver arquivos em conflito
# Resolver conflitos manualmente
git add .
git commit -m "resolve: conflitos de merge"
git push origin main
```

---

**Lembre-se**: Sempre mantenha o repositório atualizado e documente suas alterações!