// Citações sobre a Música - leitura de citacoes.md e UI dinâmica

(function () {
  const QUOTES_MD_URL = './citacoes.md';
  
  // Citações incorporadas como fallback caso o arquivo não seja carregado
  const EMBEDDED_CITATIONS = `"Uma só coisa pode ser ao mesmo tempo boa e má, e também indiferente. Por exemplo, a música é boa para o melancólico, má para o aflito, para o surdo não é boa nem má"
Spinoza 


"Um dia, quando todos os livros forem queimados por inúteis, há de haver alguém, pode ser que tenor, e talvez italiano, que ensine esta verdade aos homens. Tudo é música, meu amigo. No princípio era o dó, e o dó fez-se ré, etc". Machado de Assis

"Certos momentos da música. A música era da categoria do pensamento, ambos vibravam no mesmo movimento e espécie".  
Clarice Lispector


"Música e mito trágicos são expressões idênticas da capacidade dionisíaca do povo, sendo inseparável uma do outro". 
Friedrich Nietzsche


"Ó rei, eu guardei tal música no fundo da minha alma, e toda vez que a relembro, é mais um momento de êxtase".
Bhagavad Gita


"E assim o longo e o curto se delimitam entre si, o alto e o baixo surgem de seu próprio contraste, as notas musicais se harmonizam na própria melodia, e aquele que veio antes demarca o que veio após". 
Tao Te Ching`;

  function showFallback(message) {
    const btns = document.getElementById('quoteButtons');
    const card = document.getElementById('quoteCard');

    if (!btns) return;

    btns.innerHTML = '';
    const fallback = document.createElement('p');
    fallback.className = 'quote-fallback';
    fallback.textContent = message;
    btns.appendChild(fallback);

    if (card) {
      card.classList.add('hidden');
    }
  }

  function parseCitations(mdText) {
    // Dividir por blocos (linhas vazias duplas)
    const blocks = mdText.split(/\n\s*\n+/g).map(b => b.trim()).filter(Boolean);
    const citations = [];

    console.log('📖 Parseando citações, blocos encontrados:', blocks.length);

    for (const block of blocks) {
      const lines = block.split(/\n+/).map(l => l.trim()).filter(Boolean);
      
      if (lines.length === 0) continue;

      let quote = '';
      let author = '';

      // Estratégia 1: Se temos múltiplas linhas, primeira linha = citação, resto = autor
      if (lines.length >= 2) {
        const firstLine = lines[0];
        
        // Tentar primeiro extrair autor da primeira linha se houver padrão "texto". Autor
        // Padrão para: "texto etc". Machado de Assis (ponto antes das aspas finais)
        let match = firstLine.match(/[""](.+?)\.\s*[""]\s+([A-Z][A-Za-z\s]+?)(?:\s|\.|$)/);
        
        // Padrão alternativo: "texto" Autor (sem ponto antes das aspas)
        if (!match) {
          match = firstLine.match(/[""](.+?)[""]\s+([A-Z][A-Za-z\s]+?)(?:\s|\.|$)/);
        }
        
        if (match) {
          // Autor encontrado na primeira linha
          quote = match[1].trim() + '.'; // Adiciona o ponto de volta
          author = match[2].replace(/\.$/, '').trim();
        } else {
          // Autor está nas linhas seguintes
          quote = firstLine
            .replace(/^[\u201C\u201D"]+|[\u201C\u201D"]+$/g, '')
            .trim();
          
          author = lines.slice(1)
            .join(' ')
            .replace(/^[\s\.]+|[\s\.]+$/g, '')
            .trim();
        }
      } 
      // Estratégia 2: Linha única - procurar padrão "citação" Autor
      else if (lines.length === 1) {
        const text = lines[0];
        
        // Padrão para casos como: "texto etc". Machado de Assis
        // O ponto está antes do fechamento das aspas: "texto.". Autor
        let match = text.match(/[""](.+?)\.\s*[""]\s+([A-Z][A-Za-z\s]+?)(?:\s|\.|$)/);
        
        // Se não encontrar, tenta padrão sem ponto: "texto" Autor
        if (!match) {
          match = text.match(/[""](.+?)[""]\s+([A-Z][A-Za-z\s]+?)(?:\s|\.|$)/);
        }
        
        // Padrão mais flexível: qualquer texto após as aspas finais
        if (!match) {
          match = text.match(/[""](.+?)[""]\s+(.+)$/);
        }
        
        if (match) {
          // Se o match incluiu ponto no grupo 1, mantém; senão, adiciona se necessário
          quote = match[1].trim();
          // Se o padrão tinha ponto, ele foi capturado; se não, verifica se precisa
          if (!quote.match(/\.$/) && text.match(/[""](.+?)\.\s*[""]/)) {
            quote += '.';
          }
          author = match[2].replace(/^[\s\.]+|[\s\.]+$/g, '').trim();
        } else {
          // Fallback: tudo é citação se não há padrão claro
          quote = text
            .replace(/^[\u201C\u201D"]+|[\u201C\u201D"]+$/g, '')
            .trim();
          author = '';
        }
      }

      // Limpar autor (remover pontos finais e espaços extras)
      author = author.replace(/^[\s\.]+|[\s\.]+$/g, '').trim();

      // Validar se temos citação e autor
      if (quote && author) {
        citations.push({ author, text: quote });
        console.log('✅ Citação parseada:', author, '-', quote.substring(0, 50) + '...');
      } else {
        console.warn('⚠️ Citação inválida ou sem autor:', { quote: quote.substring(0, 30), author });
      }
    }

    console.log(`✅ Total de citações parseadas: ${citations.length}`);
    return citations;
  }

  function buildUI(citations) {
    const btns = document.getElementById('quoteButtons');
    const card = document.getElementById('quoteCard');
    const quoteTextEl = document.getElementById('quoteText');
    const quoteAuthorEl = document.getElementById('quoteAuthor');
    const closeBtn = document.getElementById('closeQuoteCard');

    if (!btns) {
      console.error('❌ Elemento quoteButtons não encontrado!');
      return;
    }
    if (!card || !quoteTextEl || !quoteAuthorEl) {
      console.error('❌ Elementos do card de citação não encontrados!');
      return;
    }

    console.log('🎨 Construindo UI para', citations.length, 'citações');

    // Limpar botões existentes
    btns.innerHTML = '';

    if (citations.length === 0) {
      console.warn('⚠️ Nenhuma citação para exibir');
      showFallback('Nenhuma citação encontrada.');
      return;
    }

    function closeQuote() {
      card.classList.add('hidden');
    }

    function showQuote(c) {
      quoteTextEl.textContent = `"${c.text}"`;
      quoteAuthorEl.textContent = c.author;
      card.classList.remove('hidden');
      
      // Scroll suave até o card
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }

    // Adicionar event listener ao botão de fechar
    if (closeBtn) {
      closeBtn.addEventListener('click', closeQuote);
    }

    citations.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-dial quote-btn';
      btn.setAttribute('aria-label', `Ver citação de ${c.author}`);
      btn.textContent = c.author;
      btn.addEventListener('click', () => showQuote(c));
      btns.appendChild(btn);
    });

    console.log('✅', citations.length, 'botões de citação criados');
  }

  async function init() {
    console.log('📚 Inicializando sistema de citações...');
    let text = null;
    
    // Detectar se está em protocolo file:// (não funciona com fetch)
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
      // Usar citações incorporadas diretamente quando em file://
      console.log('📁 Protocolo file:// detectado. Usando citações incorporadas.');
      text = EMBEDDED_CITATIONS;
      console.log('✅ Usando citações incorporadas, tamanho:', text.length, 'caracteres');
    } else {
      // Tentar carregar do arquivo apenas quando não estiver em file://
      try {
        console.log('📁 Tentando carregar:', QUOTES_MD_URL);
        const res = await fetch(QUOTES_MD_URL);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        text = await res.text();
        console.log('✅ Arquivo citacoes.md carregado do servidor, tamanho:', text.length, 'caracteres');
        
      } catch (err) {
        console.warn('⚠️ Não foi possível carregar citacoes.md:', err.message);
        console.log('💡 Usando citações incorporadas como fallback...');
        
        // Usar citações incorporadas como fallback
        text = EMBEDDED_CITATIONS;
        console.log('✅ Usando citações incorporadas, tamanho:', text.length, 'caracteres');
      }
    }
    
    if (!text || text.trim().length === 0) {
      console.error('❌ Nenhum texto de citações disponível!');
      showFallback('Erro: nenhuma citação disponível.');
      return;
    }
    
    console.log('📄 Primeiros 200 caracteres:', text.substring(0, 200));
    
    const citations = parseCitations(text);
    
    if (citations.length === 0) {
      console.error('❌ Nenhuma citação foi parseada!');
      showFallback('Erro ao processar citações. Verifique o console para mais detalhes.');
      return;
    }
    
    console.log('✅ Citações parseadas com sucesso:', citations.length);
    buildUI(citations);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
