#!/usr/bin/env python3
"""Fase 2 do mapeamento de igrejas católicas no Brasil.

Sem dependências externas. Descobre sites oficiais via Wikidata, cruza com a base
por Regional CNBB, busca páginas públicas prováveis de paróquias/doações/contato
e exporta CSVs e XLSX simples.
"""
from __future__ import annotations

import csv
import datetime as dt
import html
import json
import os
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from difflib import SequenceMatcher
from xml.sax.saxutils import escape

BASE = "/Users/vellum/Projetos Vellum/rebanhoDep/site/docs/mapeamento-igrejas"
IN_CIRC = os.path.join(BASE, "circunscricoes_catolicas_por_regionais_cnbb.csv")
OUT_CIRC = os.path.join(BASE, "circunscricoes_catolicas_enriquecidas_fase2.csv")
OUT_CAND = os.path.join(BASE, "igrejas_paroquias_candidatas_fase2.csv")
OUT_DOA = os.path.join(BASE, "canais_doacao_detectados_fase2.csv")
OUT_XLSX = os.path.join(BASE, "mapeamento_igrejas_catolicas_fase2_por_regionais.xlsx")
USER_AGENT = "Hermes church mapping research/1.0 (+public data collection)"
TODAY = dt.date.today().isoformat()

CANDIDATE_PATHS = [
    "/", "/paroquias/", "/paroquias", "/par%C3%B3quias/", "/par%C3%B3quias",
    "/foranias/", "/comunidades/", "/clero/", "/padres/", "/dizimo/", "/d%C3%ADzimo/",
    "/doacao/", "/doacoes/", "/doa%C3%A7%C3%B5es/", "/pix/", "/contato/",
]
KEYWORDS = ["paroquia", "paróquia", "paroquias", "paróquias", "comunidade", "capela", "dizimo", "dízimo", "doacao", "doação", "doacoes", "doações", "pix", "contato", "clero", "padre", "pároco", "paroco"]
DONATION_WORDS = ["pix", "doação", "doacoes", "doações", "dízimo", "dizimo", "contribua", "oferta", "banco", "agência", "agencia", "conta corrente", "chave"]

EMAIL_RE = re.compile(r"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[\s\-.]?\d{4}")
CNPJ_RE = re.compile(r"\b\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}\b")
CEP_RE = re.compile(r"\b\d{5}-?\d{3}\b")
PARISH_RE = re.compile(r"\b(?:Par[oó]quia|Santu[aá]rio|Bas[ií]lica|Catedral|Capela|Comunidade)\s+[^\n\r\t|<>{}\[\]]{3,120}", re.I)
PRIEST_RE = re.compile(r"\b(?:Pe\.|Padre|Pároco|Paroco)\s+([A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÈÊÍÓÔÕÚÇáàâãéèêíóôõúç'\-]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÈÊÍÓÔÕÚÇáàâãéèêíóôõúç'\-]+){1,5})")


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"\b(arquidiocese|diocese|prelazia|eparquia|administracao apostolica|pessoal|de|do|da|dos|das|em)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def fetch(url: str, timeout: int = 6) -> tuple[int, str, str]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xml,application/json;q=0.9,*/*;q=0.8"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read(450_000)
            ctype = resp.headers.get("content-type", "")
            charset = "utf-8"
            m = re.search(r"charset=([\w\-]+)", ctype, re.I)
            if m:
                charset = m.group(1)
            return resp.status, raw.decode(charset, errors="replace"), resp.geturl()
    except Exception as e:
        return 0, "", f"ERROR: {type(e).__name__}: {e}"


def textify(src: str) -> str:
    src = re.sub(r"(?is)<script.*?</script>|<style.*?</style>", " ", src)
    src = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>|</tr>|</h[1-6]>", "\n", src)
    src = re.sub(r"<[^>]+>", " ", src)
    src = html.unescape(src)
    return re.sub(r"[ \t]+", " ", src)


def abs_url(base: str, href: str) -> str:
    if href.startswith(("mailto:", "tel:", "javascript:", "#")):
        return ""
    return urllib.parse.urljoin(base, href)


def same_host(a: str, b: str) -> bool:
    try:
        ha = urllib.parse.urlparse(a).netloc.lower().replace("www.", "")
        hb = urllib.parse.urlparse(b).netloc.lower().replace("www.", "")
        return ha == hb
    except Exception:
        return False


def load_circ() -> list[dict]:
    with open(IN_CIRC, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def wikidata_sites() -> list[dict]:
    query = """
SELECT ?item ?itemLabel ?website WHERE {
  ?item wdt:P17 wd:Q155.
  OPTIONAL { ?item wdt:P856 ?website. }
  { ?item wdt:P31/wdt:P279* wd:Q3146899. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q665487. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q1252262. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en". }
}
"""
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": query, "format": "json"})
    status, body, final = fetch(url, timeout=30)
    if status != 200:
        print("Wikidata falhou", status, final)
        return []
    data = json.loads(body)
    out = []
    for b in data["results"]["bindings"]:
        out.append({
            "wikidata": b.get("item", {}).get("value", ""),
            "label": b.get("itemLabel", {}).get("value", ""),
            "website": b.get("website", {}).get("value", ""),
        })
    return out


def match_sites(circs: list[dict], sites: list[dict]) -> list[dict]:
    by_label = [(norm(s["label"]), s) for s in sites]
    for row in circs:
        target = norm(row["circunscricao"])
        best_score, best = 0.0, None
        for n, s in by_label:
            if not n:
                continue
            score = SequenceMatcher(None, target, n).ratio()
            if target and (target in n or n in target):
                score = max(score, 0.92)
            if score > best_score:
                best_score, best = score, s
        row["site_oficial_wikidata"] = best.get("website", "") if best and best_score >= 0.74 else ""
        row["wikidata_item"] = best.get("wikidata", "") if best and best_score >= 0.74 else ""
        row["wikidata_label"] = best.get("label", "") if best and best_score >= 0.74 else ""
        row["score_match_wikidata"] = f"{best_score:.3f}" if best else ""
    return circs


def discover_pages(site: str) -> list[str]:
    if not site:
        return []
    if not site.startswith("http"):
        site = "https://" + site
    parsed = urllib.parse.urlparse(site)
    root = f"{parsed.scheme}://{parsed.netloc}"
    urls = {site.rstrip("/") + "/"}
    for p in CANDIDATE_PATHS:
        urls.add(root + p)
    # root links
    status, body, final = fetch(site, timeout=5)
    if status == 200:
        for href in re.findall(r"href=[\"']([^\"'#]+)[\"']", body, re.I):
            u = abs_url(final, href)
            if u and same_host(final, u) and any(k in urllib.parse.unquote(u).lower() for k in KEYWORDS):
                urls.add(u.split("#")[0])
    # sitemaps
    for sm in [root + "/sitemap.xml", root + "/wp-sitemap-posts-page-1.xml", root + "/wp-sitemap-posts-post-1.xml"]:
        st, b, _ = fetch(sm, timeout=5)
        if st == 200:
            for loc in re.findall(r"<loc>(.*?)</loc>", b, re.I | re.S):
                loc = html.unescape(loc.strip())
                if same_host(root, loc) and any(k in urllib.parse.unquote(loc).lower() for k in KEYWORDS):
                    urls.add(loc)
    return list(urls)[:12]


def extract_from_page(url: str, circ: dict, source_type: str) -> tuple[list[dict], list[dict], dict]:
    status, body, final = fetch(url)
    info = {"status": status, "final_url": final, "title": ""}
    if status != 200 or not body:
        return [], [], info
    title = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
    if title:
        info["title"] = re.sub(r"\s+", " ", html.unescape(title.group(1))).strip()[:180]
    txt = textify(body)
    low = txt.lower()
    emails = sorted(set(EMAIL_RE.findall(txt)))[:5]
    phones = sorted(set(PHONE_RE.findall(txt)))[:5]
    cnpjs = sorted(set(CNPJ_RE.findall(txt)))[:5]
    priests = sorted(set(m.group(1).strip() for m in PRIEST_RE.finditer(txt)))[:5]
    donation_hit = any(w in low for w in DONATION_WORDS)
    donations = []
    if donation_hit:
        lines = []
        for line in txt.splitlines():
            l = line.strip()
            if len(l) > 20 and any(w in l.lower() for w in DONATION_WORDS):
                lines.append(l[:260])
        donations.append({
            "regional": circ["regional"], "circunscricao": circ["circunscricao"], "site_oficial": circ.get("site_oficial_wikidata", ""),
            "url_fonte": final, "titulo_pagina": info["title"], "cnpj_detectado": "; ".join(cnpjs),
            "emails_detectados": "; ".join(emails), "telefones_detectados": "; ".join(phones),
            "trechos_doacao": " | ".join(lines[:6]), "data_coleta": TODAY,
            "status_validacao": "detectado_automaticamente_em_site_publico; requer_confirmacao_manual",
        })
    candidates = []
    if any(k in urllib.parse.unquote(final).lower() for k in ["paro", "comunidade", "capela"]) or "paróquia" in low or "paroquia" in low:
        names = []
        for m in PARISH_RE.finditer(txt):
            name = re.sub(r"\s+", " ", m.group(0)).strip(" -–—:,.;")
            if 8 <= len(name) <= 120:
                names.append(name)
        seen = set()
        for name in names[:80]:
            key = norm(name)
            if key in seen:
                continue
            seen.add(key)
            candidates.append({
                "regional": circ["regional"], "sigla_estados_regional": circ["sigla_estados_regional"],
                "circunscricao": circ["circunscricao"], "tipo_circunscricao": circ["tipo_circunscricao"],
                "estado": "", "municipio": "", "regiao": "", "bairro": "", "endereco": "",
                "nome_da_igreja_paroquia": name, "cnpj": "; ".join(cnpjs),
                "canal_de_doacoes": "ver página de doações/trechos detectados" if donation_hit else "",
                "contato": "; ".join(emails + phones), "nome_do_paroco": "; ".join(priests),
                "site_oficial_circunscricao": circ.get("site_oficial_wikidata", ""), "url_fonte": final,
                "fonte": source_type, "data_coleta": TODAY,
                "status_validacao": "candidato_extraido_automaticamente; requer_validacao_manual",
            })
    return candidates, donations, info


def write_csv(path: str, rows: list[dict], fields: list[str]) -> None:
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)


def sheet_xml(rows: list[list[str]]) -> str:
    out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>']
    for r, row in enumerate(rows, 1):
        out.append(f'<row r="{r}">')
        for c, val in enumerate(row, 1):
            col = ''
            n = c
            while n:
                n, rem = divmod(n-1, 26); col = chr(65+rem) + col
            v = escape(str(val or ""))
            out.append(f'<c r="{col}{r}" t="inlineStr"><is><t>{v}</t></is></c>')
        out.append('</row>')
    out.append('</sheetData></worksheet>')
    return ''.join(out)


def write_xlsx(path: str, sheets: list[tuple[str, list[list[str]]]]) -> None:
    def safe(name):
        return re.sub(r"[\\/*?:\[\]]", " ", name)[:31] or "Aba"
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(sheets)+1)) + '</Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, len(sheets)+1)) + '</Relationships>')
        z.writestr("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + ''.join(f'<sheet name="{escape(safe(n))}" sheetId="{i}" r:id="rId{i}"/>' for i, (n, _) in enumerate(sheets, 1)) + '</sheets></workbook>')
        for i, (_, rows) in enumerate(sheets, 1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", sheet_xml(rows))


def process_circ(row: dict) -> tuple[dict, list[dict], list[dict]]:
    site = row.get("site_oficial_wikidata", "")
    pages = discover_pages(site) if site else []
    page_infos, local_candidates, local_donations = [], [], []
    for url in pages[:8]:
        cand, doa, info = extract_from_page(url, row, "site_oficial_circunscricao")
        local_candidates.extend(cand)
        local_donations.extend(doa)
        if info["status"] == 200:
            page_infos.append(info["final_url"])
    row = dict(row)
    row["paginas_candidatas_visitadas"] = str(len(pages[:8]))
    row["urls_relevantes_detectadas"] = " | ".join(page_infos[:10])
    row["tem_doacao_detectada_site_diocesano"] = "sim" if local_donations else "não"
    row["data_coleta_fase2"] = TODAY
    return row, local_candidates, local_donations


def main() -> None:
    os.makedirs(BASE, exist_ok=True)
    circs = load_circ()
    sites = wikidata_sites()
    circs = match_sites(circs, sites)
    print(f"circunscricoes={len(circs)} wikidata_registros={len(sites)} sites_match={sum(1 for r in circs if r.get('site_oficial_wikidata'))}", flush=True)

    candidates, donations, enriched = [], [], []
    with ThreadPoolExecutor(max_workers=24) as ex:
        futs = [ex.submit(process_circ, row) for row in circs]
        for i, fut in enumerate(as_completed(futs), 1):
            row, cand, doa = fut.result()
            enriched.append(row); candidates.extend(cand); donations.extend(doa)
            if i % 25 == 0:
                print(f"processadas={i} candidatos={len(candidates)} doacoes={len(donations)}", flush=True)
    enriched.sort(key=lambda r: (r.get("regional", ""), r.get("circunscricao", "")))

    # dedupe candidates
    uniq = {}
    for c in candidates:
        key = (c["circunscricao"], norm(c["nome_da_igreja_paroquia"]), c["url_fonte"])
        uniq[key] = c
    candidates = list(uniq.values())

    circ_fields = list(enriched[0].keys())
    cand_fields = ["regional","sigla_estados_regional","circunscricao","tipo_circunscricao","estado","municipio","regiao","bairro","endereco","nome_da_igreja_paroquia","cnpj","canal_de_doacoes","contato","nome_do_paroco","site_oficial_circunscricao","url_fonte","fonte","data_coleta","status_validacao"]
    doa_fields = ["regional","circunscricao","site_oficial","url_fonte","titulo_pagina","cnpj_detectado","emails_detectados","telefones_detectados","trechos_doacao","data_coleta","status_validacao"]
    write_csv(OUT_CIRC, enriched, circ_fields)
    write_csv(OUT_CAND, candidates, cand_fields)
    write_csv(OUT_DOA, donations, doa_fields)

    summary = [
        ["Métrica", "Valor"],
        ["Data coleta", TODAY],
        ["Circunscrições", len(enriched)],
        ["Sites oficiais via Wikidata", sum(1 for r in enriched if r.get("site_oficial_wikidata"))],
        ["Candidatos de paróquias/igrejas extraídos", len(candidates)],
        ["Páginas com canal/trecho de doação detectado", len(donations)],
        ["Observação", "Extração automática; CNPJ/PIX/pároco exigem validação antes de pagamentos."],
    ]
    sheets = [("Resumo", summary)]
    sheets.append(("Circunscricoes", [circ_fields] + [[r.get(f, "") for f in circ_fields] for r in enriched[:5000]]))
    sheets.append(("Paroquias candidatas", [cand_fields] + [[r.get(f, "") for f in cand_fields] for r in candidates[:5000]]))
    sheets.append(("Doacoes detectadas", [doa_fields] + [[r.get(f, "") for f in doa_fields] for r in donations[:5000]]))
    by_reg = defaultdict(list)
    for c in candidates:
        by_reg[c["regional"]].append(c)
    for reg in sorted(by_reg):
        rows = by_reg[reg]
        sheets.append((reg.replace("Regional ", "Reg "), [cand_fields] + [[r.get(f, "") for f in cand_fields] for r in rows[:2000]]))
    write_xlsx(OUT_XLSX, sheets)
    with zipfile.ZipFile(OUT_XLSX) as z:
        bad = z.testzip()
    print(json.dumps({"out_circ": OUT_CIRC, "out_candidates": OUT_CAND, "out_donations": OUT_DOA, "out_xlsx": OUT_XLSX, "xlsx_badzip": bad, "circunscricoes": len(enriched), "sites": sum(1 for r in enriched if r.get("site_oficial_wikidata")), "candidatos": len(candidates), "doacoes": len(donations)}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
