# Filosofia da Música

Aplicação web interativa com carrossel de composições musicais e conteúdo detalhado em arquivos Markdown.

## 🚀 Tecnologias

- HTML5
- JavaScript ES6+
- Tailwind CSS
- Python HTTP Server (desenvolvimento)
- Netlify (deploy)

## 📦 Instalação

1. Navegue para a pasta do projeto:
   ```bash
   cd projeto-final
   ```

2. Execute o servidor local:
   ```bash
   python3 -m http.server 8000
   ```

3. Acesse no navegador:
   ```
   http://localhost:8000
   ```

## 🎯 Funcionalidades

- [x] Carrossel horizontal com scroll suave
- [x] Cards interativos com informações essenciais
- [x] Modal responsivo para conteúdo detalhado
- [x] Carregamento dinâmico de arquivos Markdown
- [x] Design responsivo para todos os dispositivos
- [x] Sistema de fallback robusto
- [x] Navegação por teclado (acessibilidade)

## 📁 Estrutura do Projeto

```
projeto-final/
├── index.html                 # Página principal
├── js/
│   ├── config.js             # Configurações centralizadas
│   └── app.js                # Lógica principal da aplicação
├── css/
│   └── custom.css            # Estilos customizados
└── assets/                   # Imagens e recursos
```

## 🎵 Funcionamento

1. O carrossel exibe cards com informações básicas das composições
2. Ao clicar em um card, abre um modal com o conteúdo detalhado
3. O conteúdo é carregado dinamicamente dos arquivos Markdown
4. Em caso de erro, o sistema mostra mensagem apropriada

## 🎨 Personalização

### Cores e Temas

As cores principais podem ser personalizadas no `index.html`:
- `primary`: Cor principal (#1e40af)
- `secondary`: Cor secundária (#312e81)
- `accent`: Cor de destaque (#f59e0b)

### Configurações

As configurações da aplicação estão em `js/config.js`:
- `ui`: Configurações de interface
- `content`: Caminhos para arquivos e pastas
- `loading`: Configurações de carregamento
- `dev`: Configurações de desenvolvimento

## 📝 Desenvolvimento

Este projeto segue os padrões estabelecidos no repositório de padrões:
- Arquitetura modular
- Separação de responsabilidades
- Código autodocumentado
- Fallback gracioso

## 🚀 Deploy

Configurado para deploy automático no Netlify.

### Netlify.toml
```toml
[build]
  publish = "."
  command = "echo 'Static site - no build required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Arquivos MD não carregam**
   - Verificar se o servidor está rodando
   - Confirmar caminhos dos arquivos
   - Verificar console para erros

2. **Modal não abre**
   - Verificar event listeners
   - Confirmar IDs dos elementos
   - Testar em diferentes navegadores

3. **Scroll não funciona**
   - Verificar CSS scroll-snap
   - Testar em dispositivos móveis

## 📊 Métricas de Performance

- **Tempo de carregamento inicial**: < 2s
- **Carregamento de arquivos MD**: < 500ms
- **Transição de modal**: < 300ms

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato com o desenvolvedor ou abra uma issue no repositório.

---

**Desenvolvido por PVolker**  
**© Filosofia da Música - 2025**