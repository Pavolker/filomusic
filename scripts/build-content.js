#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_CSV = path.join(ROOT, 'MUSICA_9.csv');
const MARKDOWN_DIRS = [
  path.join(ROOT, 'arquivo md'), 
  path.join(ROOT, 'conceitos'),
  path.join(ROOT, 'biblioteca')
];
const DATA_JS_PATH = path.join(ROOT, 'js', 'data.js');
const MARKDOWN_JS_PATH = path.join(ROOT, 'js', 'markdown-content.js');
const YOUTUBE_JS_PATH = path.join(ROOT, 'js', 'youtube-data.js');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, contents) {
  fs.writeFileSync(filePath, contents, 'utf8');
}

function stripBom(text) {
  if (!text) return text;
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

function normalizeHeaderName(header) {
  const normalized = header.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const mapping = {
    'data': 'data',
    'titulo': 'título',
    'autor': 'autor',
    'musica': 'musica',
    'genero': 'genero',
    'atracao musical': 'atração musical',
    'grau de introspeccao': 'grau de introspecção',
    'complexidade emocional': 'complexidade emocional',
    'grau de significacao': 'grau de significação'
  };

  return mapping[normalized] || normalized;
}

function parseCsv(content) {
  const cleaned = stripBom(content).split('\n').filter(line => line.trim() !== '');
  if (cleaned.length < 2) {
    throw new Error('CSV inválido: sem dados suficientes.');
  }

  const headers = cleaned[0].split(';').map(h => h.trim());
  const normalizedHeaders = headers.map(normalizeHeaderName);
  const rows = [];

  for (let i = 1; i < cleaned.length; i++) {
    const line = cleaned[i];
    if (!line) continue;

    const values = [];
    let current = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const next = line[j + 1];

      if (char === '"' && next === '"') {
        current += '"';
        j++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ';' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    normalizedHeaders.forEach((header, index) => {
      record[header] = (values[index] || '').trim();
    });

    if (record.data && (record['título'] || record.titulo || record.musica)) {
      rows.push(record);
    }
  }

  return rows;
}

function toTemplateLiteral(value) {
  return '`' + value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    + '`';
}

function loadMarkdownFiles() {
  const entries = [];

  MARKDOWN_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir)
      .filter(name => name.toLowerCase().endsWith('.md'))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    files.forEach(file => {
      const abs = path.join(dir, file);
      const contents = readFile(abs);
      entries.push({ fileName: file, contents });
    });
  });

  return entries;
}

function buildDataModule(musicData) {
  const header = `// Arquivo gerado automaticamente por scripts/build-content.js\n` +
                 `// Não edite manualmente. Execute \`node scripts/build-content.js\` para regenerar.\n\n`;

  const dataLiteral = JSON.stringify(musicData, null, 2)
    .replace(/\\u2028|\\u2029/g, match => ({ '\\u2028': '\u2028', '\\u2029': '\u2029' }[match]));

  return header +
`const MUSIC_DATA = ${dataLiteral};\n\n` +
`if (typeof window !== 'undefined') {\n` +
`  window.musicData = MUSIC_DATA;\n` +
`}\n\n` +
`// Nota: export removido porque o arquivo é carregado como script regular, não como módulo ES6\n`;
}

function buildMarkdownModule(markdownEntries) {
  const header = `// Arquivo gerado automaticamente por scripts/build-content.js\n` +
                 `// Não edite manualmente. Execute \`node scripts/build-content.js\` para regenerar.\n\n`;

  const body = markdownEntries.map(({ fileName, contents }) => {
    return `  "${fileName.replace(/"/g, '\\"')}": ${toTemplateLiteral(contents)}`;
  }).join(',\n\n');

  const functions = `\nfunction normalizeTitle(value) {\n  if (!value && value !== 0) {\n    return '';\n  }\n\n  const stringValue = String(value)\n    .normalize('NFD')\n    .replace(/[\\\u0300-\\\u036f]/g, '')\n    .replace(/\\s+/g, ' ')\n    .trim()\n    .toUpperCase();\n\n  return stringValue;\n}\n\nfunction buildMarkdownMapping() {\n  const mapping = {};\n\n  Object.keys(MARKDOWN_CONTENT).forEach((fileName) => {\n    if (typeof fileName !== 'string') {\n      return;\n    }\n\n    if (!fileName.toLowerCase().endsWith('.md')) {\n      return;\n    }\n\n    const titlePart = fileName\n      .replace(/\\.md$/i, '')\n      .replace(/^\\s*\\d+\\s*-\\s*/, '')\n      .trim();\n\n    if (!titlePart) {\n      return;\n    }\n\n    const normalizedTitle = normalizeTitle(titlePart);\n    if (!normalizedTitle) {\n      return;\n    }\n\n    mapping[normalizedTitle] = fileName;\n  });\n\n  return mapping;\n}\n\nfunction getMarkdownContent(filename) {\n  return MARKDOWN_CONTENT[filename] || null;\n}\n\nconst MD_FILE_MAPPING = buildMarkdownMapping();\n\nif (typeof window !== 'undefined') {\n  window.getMarkdownContent = getMarkdownContent;\n  window.MARKDOWN_CONTENT = MARKDOWN_CONTENT;\n  window.MD_FILE_MAPPING = MD_FILE_MAPPING;\n  window.normalizeTitle = normalizeTitle;\n}\n\n// Nota: export removido porque o arquivo é carregado como script regular, não como módulo ES6\n`;

  return header + `const MARKDOWN_CONTENT = {\n${body}\n};\n` + functions;
}

function normalizeYoutubeUrl(url) {
  if (!url) return url;
  return url.replace(/^http:\/\//i, 'https://');
}

function loadYoutubeData() {
  if (!fs.existsSync(YOUTUBE_JS_PATH)) {
    return {};
  }

  const source = readFile(YOUTUBE_JS_PATH);
  const sandbox = { result: null, console };
  const replaced = source
    .replace('const YOUTUBE_URLS_DATA =', 'result =')
    .replace(/if\s*\(typeof window[^]+?}\s*/m, '')
    .replace(/export\s+\{[^}]+\};?/g, '');

  try {
    vm.runInNewContext(replaced, sandbox, { filename: 'youtube-data.js' });
    return sandbox.result || {};
  } catch (error) {
    console.error('Falha ao avaliar youtube-data.js:', error);
    return {};
  }
}

function buildYoutubeModule(youtubeData) {
  const header = `// Arquivo gerado automaticamente por scripts/build-content.js\n` +
                 `// Não edite manualmente. Execute \`node scripts/build-content.js\` para regenerar.\n\n`;

  const serialized = JSON.stringify(youtubeData, null, 2);

  return header +
`const YOUTUBE_URLS_DATA = ${serialized};\n\nif (typeof window !== 'undefined') {\n  window.YOUTUBE_URLS_DATA = YOUTUBE_URLS_DATA;\n}\n\n// Nota: export removido porque o arquivo é carregado como script regular, não como módulo ES6\n`;
}

function normalizePlaylistMap(map) {
  const normalized = {};
  Object.entries(map).forEach(([key, urls]) => {
    const sanitizedKey = key.trim();
    const sanitizedUrls = Array.isArray(urls) ? urls.map(normalizeYoutubeUrl).filter(Boolean) : [];
    normalized[sanitizedKey] = sanitizedUrls;
  });
  return normalized;
}

function normalizeFileName(name) {
  if (!name) return '';
  const normalized = typeof name.normalize === 'function' ? name.normalize('NFD') : name;
  return normalized
    .replace(/\.[mM][dD]$/, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase();
}

function auditPlaylists(musicData, youtubeData) {
  const normalizedMap = {};
  Object.keys(youtubeData).forEach(key => {
    normalizedMap[normalizeFileName(key)] = youtubeData[key];
  });

  let missingCount = 0;
  let emptyCount = 0;

  musicData.forEach(entry => {
    const title = entry['título'] || entry.musica || '';
    const year = entry.data || '';
    const composite = `${year} - ${title}`.trim();
    const normalizedKey = normalizeFileName(composite);
    const urls = normalizedMap[normalizedKey];

    if (!urls) {
      missingCount++;
    } else if (urls.length === 0) {
      emptyCount++;
    }
  });

  return { missingCount, emptyCount };
}

function main() {
  console.log('🔧 Iniciando geração de conteúdo...');

  const csvContent = readFile(SOURCE_CSV);
  const musicData = parseCsv(csvContent);
  console.log(`🎼 ${musicData.length} entradas musicais carregadas do CSV.`);

  const markdownEntries = loadMarkdownFiles();
  console.log(`📚 ${markdownEntries.length} arquivos Markdown carregados.`);

  const rawYoutubeData = loadYoutubeData();
  const youtubeData = normalizePlaylistMap(rawYoutubeData);
  const nonHttps = Object.values(youtubeData).reduce((acc, urls) => acc + urls.filter(url => url.startsWith('http://')).length, 0);
  if (nonHttps > 0) {
    console.warn(`⚠️ ${nonHttps} URLs YouTube ainda usam http. Elas foram normalizadas para https.`);
  }

  writeFile(DATA_JS_PATH, buildDataModule(musicData));
  writeFile(MARKDOWN_JS_PATH, buildMarkdownModule(markdownEntries));
  writeFile(YOUTUBE_JS_PATH, buildYoutubeModule(youtubeData));

  const audit = auditPlaylists(musicData, youtubeData);
  if (audit.missingCount > 0 || audit.emptyCount > 0) {
    console.warn(`⚠️ Playlists ausentes: ${audit.missingCount}. Playlists vazias: ${audit.emptyCount}.`);
  } else {
    console.log('✅ Todas as músicas possuem playlists associadas.');
  }

  console.log('✨ Geração concluída.');
}

main();
