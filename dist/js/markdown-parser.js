// Conversor simples de Markdown → HTML com suporte básico para títulos,
// ênfases, listas, blockquotes e links (incluindo atalhos para YouTube).

(function () {
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function transformInline(text) {
        if (!text) {
            return '';
        }

        let transformed = escapeHtml(text);

        // Inline code
        transformed = transformed.replace(/`([^`]+?)`/g, '<code>$1</code>');

        // Bold (strong)
        transformed = transformed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        transformed = transformed.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic (em)
        transformed = transformed.replace(/(^|[^\*])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '$1<em>$2</em>');
        transformed = transformed.replace(/(^|[^_])_(?!\s)(.+?)(?<!\s)_(?!_)/g, '$1<em>$2</em>');

        // Links padrão [texto](url)
        transformed = transformed.replace(/\[([^\]]+)]\(([^)]+)\)/g, (match, label, url) => {
            const safeUrl = escapeHtml(url);
            const safeLabel = label;
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
        });

        // YouTube short-hand
        const youtubeButton = (url) => (
            `<div class="my-4"><a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">🎵 Assistir no YouTube</a></div>`
        );

        transformed = transformed.replace(
            /https?:\/\/(?:www\.)?youtu\.be\/[A-Za-z0-9_-]+/g,
            (url) => youtubeButton(url)
        );

        transformed = transformed.replace(
            /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+/g,
            (url) => youtubeButton(url)
        );

        // Links simples restantes
        transformed = transformed.replace(
            /https?:\/\/[^\s<]+/g,
            (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );

        // Quebra de linha manual
        transformed = transformed.replace(/ {2}\n/g, '<br>');

        return transformed;
    }

    function closeActiveList(buffer, state) {
        if (state.activeList) {
            buffer.push(`</${state.activeList}>`);
            state.activeList = null;
        }
    }

    function markdownToHtml(markdown) {
        if (!markdown) {
            return '';
        }

        const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
        const buffer = [];
        const state = { activeList: null };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (!trimmed) {
                closeActiveList(buffer, state);
                // Evita parágrafos vazios consecutivos
                const prev = buffer[buffer.length - 1];
                if (prev && !prev.startsWith('<p>')) {
                    return;
                }
                buffer.push('<p class="mb-4 text-gray-200 leading-relaxed"></p>');
                return;
            }

            let match;

            // Heading
            match = trimmed.match(/^(#{1,3})\s+(.*)$/);
            if (match) {
                closeActiveList(buffer, state);
                const level = match[1].length;
                const text = transformInline(match[2]);
                const headingClasses = {
                    1: 'text-3xl font-bold mb-6 text-blue-900',
                    2: 'text-2xl font-bold mb-4 text-blue-900',
                    3: 'text-xl font-bold mb-3 text-blue-900'
                }[level] || 'font-bold text-blue-900';
                buffer.push(`<h${level} class="${headingClasses}">${text}</h${level}>`);
                return;
            }

            // Blockquote
            match = trimmed.match(/^>\s?(.*)$/);
            if (match) {
                closeActiveList(buffer, state);
                const text = transformInline(match[1]);
                buffer.push(`<blockquote class="border-l-4 border-blue-500/70 pl-4 italic text-blue-900 my-4">${text}</blockquote>`);
                return;
            }

            // Ordered list item
            match = trimmed.match(/^\d+\.\s+(.*)$/);
            if (match) {
                if (state.activeList !== 'ol') {
                    closeActiveList(buffer, state);
                    buffer.push('<ol class="list-decimal list-inside space-y-2 mb-4">');
                    state.activeList = 'ol';
                }
                buffer.push(`<li>${transformInline(match[1])}</li>`);
                return;
            }

            // Unordered list item
            match = trimmed.match(/^[-*+]\s+(.*)$/);
            if (match) {
                if (state.activeList !== 'ul') {
                    closeActiveList(buffer, state);
                    buffer.push('<ul class="list-disc list-inside space-y-2 mb-4">');
                    state.activeList = 'ul';
                }
                buffer.push(`<li>${transformInline(match[1])}</li>`);
                return;
            }

            // Paragraph fallback
            closeActiveList(buffer, state);
            buffer.push(`<p class="mb-4 leading-relaxed">${transformInline(trimmed)}</p>`);
        });

        closeActiveList(buffer, state);

        // Remove parágrafos vazios consecutivos no final
        while (buffer.length && buffer[buffer.length - 1] === '<p class="mb-4 leading-relaxed"></p>') {
            buffer.pop();
        }

        return buffer.join('\n');
    }

    if (typeof window !== 'undefined') {
        window.markdownToHtml = markdownToHtml;
    }
})();
