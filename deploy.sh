#!/bin/bash

# Script de Deploy Automático - Carrossel de Música
# Este script automatiza o processo de versionamento e deploy

echo "🎵 Carrossel de Música - Deploy Automático"
echo "=========================================="

# Verificar se há alterações
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Alterações detectadas. Iniciando processo de commit..."
    
    # Adicionar todos os arquivos
    git add .
    
    # Solicitar mensagem de commit ou usar padrão
    if [ -z "$1" ]; then
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        COMMIT_MSG="Update: Alterações automáticas - $TIMESTAMP"
    else
        COMMIT_MSG="$1"
    fi
    
    echo "💾 Fazendo commit: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"
    
    # Push para GitHub
    echo "🚀 Enviando para GitHub..."
    git push origin main
    
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Repositório: https://github.com/Pavolker/musica-carrossel"
    
else
    echo "✅ Nenhuma alteração detectada. Repositório está atualizado."
fi

echo ""
echo "📊 Status do repositório:"
git status --short