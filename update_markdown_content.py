#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import sys
from pathlib import Path
from textwrap import dedent


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR
ARQUIVO_MD_DIR = ROOT_DIR / "arquivo md"
BIBLIOTECA_DIR = ROOT_DIR / "biblioteca"
OUTPUT_MARKDOWN = ROOT_DIR / "js" / "markdown-content.js"
OUTPUT_BIBLIOTECA = ROOT_DIR / "js" / "biblioteca-content.js"


def escape_js_string(content: str) -> str:
    """Escapa caracteres especiais para utilização segura em template literals."""
    escaped = (
        content
        .replace("\\", "\\\\")
        .replace("`", "\\`")
        .replace("${", "\\${")
    )
    return escaped


def read_markdown_files(directory: Path) -> dict[str, str]:
    """Retorna um dicionário {nome_do_arquivo: conteúdo} para todos os .md de um diretório."""
    if not directory.exists():
        raise FileNotFoundError(f"Pasta de markdown não encontrada: {directory}")

    markdown_files = sorted(path for path in directory.glob("*.md") if path.is_file())
    if not markdown_files:
        raise FileNotFoundError(f"Nenhum arquivo .md encontrado em {directory}")

    contents: dict[str, str] = {}
    for file_path in markdown_files:
        text = file_path.read_text(encoding="utf-8").strip()
        contents[file_path.name] = escape_js_string(text)

    return contents


def build_js_content(markdown_contents: dict[str, str]) -> str:
    """Gera o conteúdo final do arquivo JavaScript com template consistente."""
    entries = []
    for filename, content in markdown_contents.items():
        entries.append(f'    "{filename}": `{content}`')

    joined_entries = ",\n\n".join(entries)

    template = dedent(
        """\
        // Conteúdo dos arquivos markdown embarcado
        const MARKDOWN_CONTENT = {
        __ENTRIES__
        };

        function normalizeTitle(value) {
            if (!value && value !== 0) {
                return '';
            }

            const stringValue = String(value)
                .normalize('NFD')
                .replace(/[\\u0300-\\u036f]/g, '')
                .replace(/\\s+/g, ' ')
                .trim()
                .toUpperCase();

            return stringValue;
        }

        function buildMarkdownMapping() {
            const mapping = {};

            Object.keys(MARKDOWN_CONTENT).forEach((fileName) => {
                if (typeof fileName !== 'string') {
                    return;
                }

                if (!fileName.toLowerCase().endsWith('.md')) {
                    return;
                }

                const titlePart = fileName
                    .replace(/\\.md$/i, '')
                    .replace(/^\\s*\\d+\\s*-\\s*/, '')
                    .trim();

                if (!titlePart) {
                    return;
                }

                const normalizedTitle = normalizeTitle(titlePart);
                if (!normalizedTitle) {
                    return;
                }

                mapping[normalizedTitle] = fileName;
            });

            return mapping;
        }

        function getMarkdownContent(filename) {
            return MARKDOWN_CONTENT[filename] || null;
        }

        const MD_FILE_MAPPING = buildMarkdownMapping();

        if (typeof window !== 'undefined') {
            window.getMarkdownContent = getMarkdownContent;
            window.MARKDOWN_CONTENT = MARKDOWN_CONTENT;
            window.MD_FILE_MAPPING = MD_FILE_MAPPING;
            window.normalizeTitle = normalizeTitle;
        }
        """
    ).strip()

    return template.replace("__ENTRIES__", joined_entries)


def build_biblioteca_content(markdown_contents: dict[str, str]) -> str:
    """Gera o conteúdo JavaScript para os textos da biblioteca."""
    entries = []
    for filename, content in markdown_contents.items():
        entries.append(f'        "{filename}": `{content}`')

    joined_entries = ",\n\n".join(entries)

    template = dedent(
        """\
        // Conteúdo da Pequena Biblioteca da Filosofia da Música gerado automaticamente
        defineBibliotecaContent();

        function defineBibliotecaContent() {
            const BIBLIOTECA_CONTENT = {
        __ENTRIES__
            };

            function normalizeKey(value) {
                if (value === undefined || value === null) {
                    return '';
                }

                return String(value)
                    .normalize('NFD')
                    .replace(/[\\u0300-\\u036f]/g, '')
                    .replace(/\\.md$/i, '')
                    .replace(/\\s+/g, ' ')
                    .trim()
                    .toUpperCase();
            }

            const NORMALIZED_INDEX = {};

            Object.keys(BIBLIOTECA_CONTENT).forEach((fileName) => {
                if (typeof fileName !== 'string') {
                    return;
                }

                const directKey = normalizeKey(fileName);
                if (directKey && !NORMALIZED_INDEX[directKey]) {
                    NORMALIZED_INDEX[directKey] = fileName;
                }

                const nfcKey = normalizeKey(fileName.normalize('NFC'));
                if (nfcKey && !NORMALIZED_INDEX[nfcKey]) {
                    NORMALIZED_INDEX[nfcKey] = fileName;
                }
            });

            function resolveFilename(filename) {
                if (typeof filename !== 'string') {
                    return null;
                }

                if (BIBLIOTECA_CONTENT[filename]) {
                    return filename;
                }

                if (typeof filename.normalize === 'function') {
                    const nfd = filename.normalize('NFD');
                    if (BIBLIOTECA_CONTENT[nfd]) {
                        return nfd;
                    }

                    const nfc = filename.normalize('NFC');
                    if (BIBLIOTECA_CONTENT[nfc]) {
                        return nfc;
                    }
                }

                const normalizedKey = normalizeKey(filename);
                if (normalizedKey && NORMALIZED_INDEX[normalizedKey]) {
                    return NORMALIZED_INDEX[normalizedKey];
                }

                return null;
            }

            function getBibliotecaContent(filename) {
                const resolved = resolveFilename(filename);
                return resolved ? BIBLIOTECA_CONTENT[resolved] : null;
            }

            if (typeof window !== 'undefined') {
                window.BIBLIOTECA_CONTENT = BIBLIOTECA_CONTENT;
                window.getBibliotecaContent = getBibliotecaContent;
                window.resolveBibliotecaFilename = resolveFilename;
            }
        }
        """
    ).strip()

    return template.replace("__ENTRIES__", joined_entries)


def write_output(js_content: str) -> None:
    OUTPUT_MARKDOWN.write_text(js_content + "\n", encoding="utf-8")


def write_biblioteca_output(js_content: str) -> None:
    OUTPUT_BIBLIOTECA.write_text(js_content + "\n", encoding="utf-8")


def main() -> int:
    try:
        markdown_arquivo = read_markdown_files(ARQUIVO_MD_DIR)
        markdown_biblioteca = read_markdown_files(BIBLIOTECA_DIR)

        js_content = build_js_content(markdown_arquivo)
        write_output(js_content)

        biblioteca_content = build_biblioteca_content(markdown_biblioteca)
        write_biblioteca_output(biblioteca_content)
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Erro ao atualizar arquivos markdown: {exc}", file=sys.stderr)
        return 1

    print(
        f"Arquivos atualizados com {len(markdown_arquivo)} markdowns (arquivo md) "
        f"e {len(markdown_biblioteca)} markdowns (biblioteca)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
