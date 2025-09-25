#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import re

# Mapeamento dos títulos para os arquivos MD (copiado do config.js)
MD_FILE_MAPPING = {
    'CARMINA BURANA': '1100 - CARMINA BURANA.md',
    'BACH': '1700 - BACH.md',
    'MINUETO': '1771 - MINUETO.md',
    'ODE AN DIE FREUD': '1822 - ODE AN DIE FREUD.md',
    'SCHERZO N2': '1837 - SCHERZO N2.md',
    'NABUCO': '1842 - NABUCO.md',
    'RICHARD STRAUSS': '1869 - RICHARD STRAUSS.md',
    'BARCAROLLE': '1881- BARCAROLLE.md',
    'AS FLORES': '1883 - AS FLORES.md',
    'KONOMICHI': '1933 - KONOMICHI.md',
    'ESTA CHEGANDO': '1942 - ESTA CHEGANDO.md',
    'A VIRGEM': '1945 - A VIRGEM.md',
    'CÃO DE CAÇA': '1956 - CÃO DE CAÇA.md',
    'JAZZ': '1958 - JAZZ.md',
    'VOLARE, NEL BLU DIPINTO DI BLU': '1958 - VOLARE, NEL BLU DIPINTO DI BLU.md',
    'ARTE DE OUVIR': '1959 - ARTE DE OUVIR.md',
    'TRINI LOPEZ': '1960 - TRINI LOPEZ.md',
    'BELLA CIAO': '1961 - Bella Ciao.md',
    'RITA PAVONI': '1961 - Rita Pavoni.md',
    'INSENSATEZ': '1962 - INSENSATEZ.md',
    'RONETTES': '1963 - RONETTES.md',
    'PAUL SIMON': '1964 - PAUL SIMON.md',
    'METAFÓRICO': '1964 - METAFÓRICO.md',
    'THE ANIMALS': '1964 - The Animals.md',
    'METEORO BLUE': '1964 - METEORO BLUE.md',
    'PETULA CLARK': '1965 - Petula Clark.md',
    'THE YOUNGBLOODS': '1966 - The Youngbloods-1.md',
    'MAMAS ANDA PAPAS': '1966 - Mamas anda Papas.md',
    'ROLLING STONES': '1966 - ROLLING STONES.md',
    'JOHNY RIVERS': '1966 - Johny Rivers.md',
    'SERGIO MENDES': '1966 - Sergio Mendes.md',
    'TURTLES': '1966 - The Turtles.md',
    'ATAQUE A CASA BRANCA': '1966 - Leno e Lilian.md',
    'TERNURINHA': '1966 - TERNURINHA.md',
    'LENO E LILIAN': '1966 - Leno e Lilian.md',
    'NANCY SINATRA': '1966 - Nancy Sinatra.md',
    'DONOVAN PHILIPS': '1967 - Donovan Philips.md',
    'THE SEEKERS': '1967 - The Seekers.md',
    'A VOLTA DO BOÊMIO': '1967 - A volta do Boêmio.md',
    'BEE GEES': '1967 - BEE GEES.md',
    'HERMAN HERMIS': '1967 - HERMAN HERMIS.md',
    'SIMONAL': '1967 - SIMONAL.md',
    'THE TURTLES': '1967 - The Turtles.md',
    'TREMELOES': '1967 - Tremeloes.md',
    'LULU': '1967 - Lulu.md',
    'NILSSON': '1968 - Nilsson.md',
    'GERALDO VANDRE': '1968 - GERALDO VANDRE.md',
    'STEVIE WONDER': '1968 - Stevie Wonder.md',
    'IAN A GADDA DA VIDA': '1968 - Ian a Gadda da Vida.md',
    'TEN YEAR AFTER': '1968 - TEN YEAR AFTER.md',
    'TOMMY JAMES': '1968 - Tommy James.md',
    'ANTONIO ADOLFO E A BRAZUCA': '1969 - Antonio Adolfo e A Brazuca.md',
    'B. J. THOMAS': '1969 - B. J. Thomas.md',
    'JANE BIRKIN': '1969 - Jane Birkin.md',
    'PAULO DINIZ': '1969 - Paulo Diniz.md',
    'SHOCKING BLUE': '1969 - Shocking  Blue.md',
    'MARMALADE': '1969 - MARMALADE.md',
    'THE HOLLIES': '1969 - The  Hollies.md',
    'TOMMY ROE': '1969 - Tommy Roe.md',
    'SANTANA': '1969 - Santana.md',
    'GAL': '1970 - GAL.md',
    'GRAND FUNK RAILROAD': '1970 - Grand Funk Railroad.md',
    'BADFINGER': '1970 - BADFINGER.md',
    'CARPENTERS': '1970 - CARPENTERS.md',
    'PAUL MACCARTNEY': '1970 - Paul Maccartney.md',
    'PATTIE BOYD': '1970 - Pattie Boyd.md',
    'ROCK PESADO': '1970 - ROCK PESADO.md',
    'TERRA RARA': '1970 - TERRA RARA.md',
    'BOBBY BLOOM': '1970 - Bobby Bloom.md',
    'BREAD': '1970 - Bread.md',
    'LINN ANDERSON': '1970 - LINN ANDERSON.md',
    'MUNGO JERRY': '1970 - Mungo Jerry.md',
    'SLADE': '1970 - SLADE.md',
    'TONY ORLANDO': '1970 - TONY ORLANDO.md',
    'TRIO GALLETA': '1970 - Trio Galleta.md',
    'A ALMA DO RITMO': '1970 - A ALMA DO RITMO.md',
    'THREE DOG NIGHT': '1970 - Three Dog Night.md',
    'LED ZEPPELIN': '1971 - Led Zeppelin.md',
    'MARDI GRAS': '1971 - MARDI GRAS.md',
    'THE SWEET': '1971 - The Sweet.md',
    'THE WHO': '1971 - THE WHO.md',
    'YES': '1971 - YES.md',
    'YOU\'VE GOT A FRIEND': '1971 - YOU\'VE GOT A FRIEND.md',
    'DUBLE FANTASY': '1971 - DUBLE FANTASY.md',
    'OH YOKO': '1971 - Oh Yoko.md',
    'ELTON JOHN': '1971 - ELTON JOHN.md',
    'GENESIS': '1971 - GENESIS.md',
    'JETHRO TULL': '1971 - Jethro Tull.md',
    'OPS, FOI ENGANO': '1971 - OPS, FOI ENGANO.md',
    'LEON RUSSEL': '1971 - LEON RUSSEL.md',
    'LOBO': '1971 - Lobo.md',
    'MIDDLE OF THE ROAD': '1971 - Middle of The Road.md',
    'MOUTH AND MACNEAL': '1971 - Mouth and MacNeal .md',
    'POP TOPS': '1971 - Pop-Tops.md',
    'PROCOL HARUM': '1971 - Procol Harum.md',
    'THE STAMPEDERS': '1971 - The Stampeders.md',
    'OS IRMÃOS CANTAM': '1971 - OS IRMÃOS CANTAM.md',
    'DON MCLEAN': '1972 - Don Mclean.md',
    'DOOBIE BROTHERS': '1972 - Doobie Brothers.md',
    'NOVOS BAIANOS': '1972 - NOVOS BAIANOS.md',
    'YELLOWSTONE AND VOICE': '1972 - Yellowstone and Voice.md',
    '5TH DIMENSION': '1972 - 5Th Dimension.md',
    'AL GREEN': '1972 - Al Green.md',
    'CREEDENCE': '1972 - CREEDENCE - SAIL AWAY.md',
    'DEEP PURBLE': '1972 - Deep Purble.md',
    'ROBERTA FLACK': '1972 - Roberta Flack.md',
    'CARLY SIMON': '1972 - Carly Simon.md',
    'DANIEL BOONE': '1972 - Daniel Boone.md',
    'FORTUNES': '1972 - FORTUNES.md',
    'GARY GLITTER': '1972 - GARY GLITTER.md',
    'THE TEMPTATIONS': '1972 - The Temptations.md',
    'TIMMY THOMAS': '1972 - Timmy  Thomas.md',
    'DAVE EDMUNDS': '1972 - Dave Edmunds.md',
    'TODD RUNDGREN': '1972 - Todd Rundgren.md',
    'DISCOS MARCOS PEREIRA': '1973 - Discos Marcos Pereira.md',
    'GLADYS KNIGHT & THE PIPS': '1973 - Gladys Knight & the Pips.md',
    'OSIBISA': '1973 - Osibisa .md',
    'SUZI QUATRO': '1973 - Suzi Quatro.md',
    'TAMBORES': '1973 - TAMBORES.md',
    'ELVIS PRESLEY': '1973 - Elvis Presley.md',
    'ALBERT HAMMOND': '1973 - ALBERT HAMMOND.md',
    'CHARLIE RICH': '1973 - CHARLIE RICH.md',
    'PAUL BRYAN': '1973 - Paul Bryan.md',
    'STORIES': '1973 - Stories.md',
    'SUPERTRAMP': '1974 - SUPERTRAMP.md',
    'BACHAMAN TURNER ORVERDRIVE': '1974 - Bachaman Turner Orverdrive.md',
    'BARRY MANILOW': '1974 - Barry Manilow.md',
    'MINNIE RIPERTON': '1974 - Minnie  Riperton.md',
    'PAPER LACE': '1974 - Paper Lace.md',
    'REDBONE': '1974 - Redbone.md',
    'THE RUBENTES': '1974 - The Rubentes.md',
    'A LOURA': '1974 - A LOURA.md',
    'IMPROVISADOR': '1975 - IMPROVISADOR.md',
    'ARTHUR MOREIRA': '1975 - Arthur Moreira.md',
    'MALDITO': '1975 - MALDITO.md',
    'CLAUDE BOLLING': '1975 - Claude Bolling.md',
    'ABBA': '1975 - ABBA.md',
    '10CC': '1975 - 10cc .md',
    'BELLAMY BROTHERS': '1976 - Bellamy Brothers.md',
    'BELLE E SABASTIAN': '1976 - BELLE E SABASTIAN.md',
    'RAUL SEIXAS': '1977 - RAUL SEIXAS.md',
    'KATE BUSCH': '1978 - KATE BUSCH .md',
    'BANDEIRA DE AÇO': '1978 - BANDEIRA DE AÇO.md',
    'ZIGGY STARDUST': '1979 - ZIGGY STARDUST.md',
    'BONEY M': '1979 - Boney M.md',
    'POLONAISE': '1979 - POLONAISE.md',
    'LEGIÃO URBANA': '1980 - LEGIÃO URBANA.md',
    'TOWSHEND': '1980 - TOWSHEND.md',
    'UNDER PRESSURE': '1981 - UNDER PRESSURE.md',
    'TOTO': '1982 - TOTO.md',
    'VIOLENTE FEMMES': '1983 VIOLENTE FEMMES.md',
    'FELIZ NATAL': '1984 - FELIZ NATAL.md',
    'LA GUITARRA': '1986 - LA GUITARRA.md',
    'WILBURYS': '1988 - WILBURYS.md',
    'Satie': '1988 - SATIE.md',
    'ENIGMA': '1990 - ENIGMA.md',
    'TEREZA SALGUEIRO': '1991 - TEREZA SALGUEIRO.md',
    'O CEARENCE DO ESCRACHO': '1991 - O CEARENCE DO ESCRACHO.md',
    'BOBBY MACFERIN': '1992 - BOBBY MACFERIN.md',
    'ISRAEL KAMAKAWIWO\'OLE': '1993 - ISRAEL KAMAKAWIWO\'OLE.md',
    'DEEP FOREST': '1997 - DEEP FOREST.md',
    'ZE COCO DO RIACHAO': '1997 - ZE COCO DO RIACHAO.md',
    'CANTORA DE RUA': '1997 - CANTORA DE RUA.md',
    'NINHO DA MÚSICA': '1998 - NINHO DA MÚSICA.md',
    'PEAKY BLINDERS': '2001 - PEAKY BLINDERS.md',
    'GOTAN PROJET': '2001 - GOTAN PROJET.md',
    'EPITÁFIO': '2002 - EPITÁFIO.md',
    'BAJOFONDO': '2002 - BAJOFONDO.md',
    'SALIR CORRIENDO': '2002 - SALIR CORRIENDO.md',
    'CARINHOSO': '2003 - CARINHOSO.md',
    'MOINHO': '2007 - MOINHO.md',
    'O REI DA NOITE': '2007 - O REI DA NOITE.md',
    'SER DIFERENTE': '2007 - SER DIFERENTE.md',
    'MIRANDA!': '2007 - Miranda! .md',
    'ANDREAS SCHOLL': '2008 - ANDREAS SCHOLL.md',
    'JULIETA VENEGAS': '2008 - Julieta Venegas.md',
    'CARL DOUGLAS': '2008 - CARL DOUGLAS.md',
    'NÃO DESONRE O MEU NOME': '2009 - NÃO DESONRE MEU NOME.md',
    'ARNALDO ANTUNES': '2009 - ARNALDO ANTUNES.md',
    'A DURGA DA MARIMBA': '2011 - A DURGA DA MARIMBA.md',
    'NOVO SOM EM MINAS': '2012 - NOVO SOM EM MINAS.md',
    'O SOM DO MERCADO': '2012 - O SOM DO MERCADO.md',
    'VOZES DAFRICA': '2013 - VOZES DAFRICA.md',
    'BARBARA': '2013 - BARBARA.md',
    'MÚSICA LAGOM': '2013 - MÚSICA LAGOM.md',
    'TENGO MIEDO': '2014 - TENGO MIEDO.md',
    'ANDRES CALAMARO': '2014 - ANDRES CALAMARO.md',
    'MUSICA DO NORTE': '2014 - MUSICA DO NORTE.md',
    'YIRA, YIRA': '2014 - YIRA, YIRA.md',
    'ARQUITETO DO SOM': '2015 - ARQUITETO DO SOM.md',
    'PAMPLAMOOSE': '2015 - PAMPLAMOOSE.md',
    'JAZZ VINTAGE': '2016 - JAZZ VINTAGE.md',
    'LA LA LAND': '2016- LA LA LAND.md',
    'M A N T R A': '2019 - M A N T R A.md',
    'A MUSA': '2019 - A MUSA.md',
    'DYLAN - AS MÚSICAS DA MÚSICA': '2020 - DYLAN - AS MÚSICAS DA MÚSICA.md'
}

def escape_js_string(content):
    """Escapa caracteres especiais para string JavaScript"""
    # Escapa backslashes primeiro
    content = content.replace('\\', '\\\\')
    # Escapa aspas
    content = content.replace('`', '\\`')
    content = content.replace('${', '\\${')
    return content

def read_markdown_file(file_path):
    """Lê o conteúdo de um arquivo markdown"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            return escape_js_string(content)
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {file_path}")
        return None
    except Exception as e:
        print(f"Erro ao ler {file_path}: {e}")
        return None

def update_markdown_content_js():
    """Atualiza o arquivo markdown-content.js com todos os arquivos"""
    base_dir = "/Users/pvolkermini/Library/Mobile Documents/com~apple~CloudDocs/APP DEV/MUSICA CARROSEL"
    md_dir = os.path.join(base_dir, "arquivo md")
    js_file = os.path.join(base_dir, "js", "markdown-content.js")
    
    # Coleta todos os conteúdos
    markdown_contents = {}
    
    print("Processando arquivos markdown...")
    for title, filename in MD_FILE_MAPPING.items():
        file_path = os.path.join(md_dir, filename)
        content = read_markdown_file(file_path)
        if content is not None:
            markdown_contents[filename] = content
            print(f"✓ {filename}")
        else:
            print(f"✗ {filename} (não encontrado)")
    
    # Gera o conteúdo do arquivo JavaScript
    js_content = """// Conteúdo dos arquivos markdown embarcado
const MARKDOWN_CONTENT = {
"""
    
    for filename, content in markdown_contents.items():
        js_content += f'    "{filename}": `{content}`,\n\n'
    
    js_content += """};

// Função para obter conteúdo markdown
function getMarkdownContent(filename) {
    return MARKDOWN_CONTENT[filename] || null;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.getMarkdownContent = getMarkdownContent;
    window.MARKDOWN_CONTENT = MARKDOWN_CONTENT;
}
"""
    
    # Escreve o arquivo
    try:
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print(f"\n✓ Arquivo {js_file} atualizado com {len(markdown_contents)} arquivos!")
        return True
    except Exception as e:
        print(f"Erro ao escrever arquivo: {e}")
        return False

if __name__ == "__main__":
    print("Atualizando markdown-content.js...")
    success = update_markdown_content_js()
    if success:
        print("Processo concluído com sucesso!")
    else:
        print("Processo falhou!")