# Ferramentas de Conversao

Todas as ferramentas sao definidas centralmente em `src/catalog.ts`.

## Documentos

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| PDF para DOCX | `pdf-to-docx` | PDF | DOCX | iLovePDF + fallback local |
| DOCX para PDF | `docx-to-pdf` | DOCX | PDF | iLovePDF |
| Office para PDF | `office-to-pdf` | DOC/XLS/PPT/OD* | PDF | iLovePDF |
| HTML para PDF | `html-to-pdf` | HTML | PDF | iLovePDF |

## Imagens

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| JPG para PNG | `jpg-to-png` | JPG/JPEG | PNG | Sharp |
| JPEG para PNG | `jpeg-to-png` | JPEG | PNG | Sharp |
| PNG para JPG | `png-to-jpg` | PNG | JPG | Sharp |
| PNG para JPEG | `png-to-jpeg` | PNG | JPEG | Sharp |
| Imagem para PDF | `image-to-pdf` | JPG/JPEG/PNG/TIFF | PDF | iLovePDF |

## Audio e video

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| MP4 para MP3 | `mp4-to-mp3` | MP4 | MP3 | FFmpeg |

## Extracao e OCR

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| PDF para texto | `pdf-to-text` | PDF | TXT | Parser local / OCR |
| OCR em PDF | `pdf-ocr` | PDF | PDF | iLovePDF |
| Extracao avancada | `pdf-extract` | PDF | TXT/CSV | iLovePDF |

## 3D

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| Conversor 3D | `3d-convert` | STL/OBJ/STEP/FBX/GLB/... | formato selecionado | Aspose 3D |

Formatos de saida 3D suportados no UI:

- STL
- OBJ
- FBX
- GLB
- GLTF
- DAE
- PLY
- AMF
- 3DS
- U3D
- DRC
- RVM
- PDF 3D

## Workflows PDF avancados

| Ferramenta | ID | Entrada | Saida | Provedor principal |
|---|---|---|---|---|
| Unir PDFs | `pdf-merge` | varios PDFs | PDF | iLovePDF |
| Dividir PDF | `pdf-split` | PDF | ZIP/PDF | iLovePDF |
| Compactar PDF | `pdf-compress` | PDF | PDF | iLovePDF |
| PDF para JPG | `pdf-to-jpg` | PDF | ZIP | iLovePDF |
| PDF para PDF/A | `pdf-to-pdfa` | PDF | PDF | iLovePDF |
| Validar PDF/A | `pdf-validate-pdfa` | PDF | JSON | iLovePDF |
| Girar PDF | `pdf-rotate` | PDF | PDF | iLovePDF |
| Desbloquear PDF | `pdf-unlock` | PDF | PDF | iLovePDF |
| Proteger PDF | `pdf-protect` | PDF | PDF | iLovePDF |
| Marca d'agua | `pdf-watermark` | PDF | PDF | iLovePDF |
| Numerar paginas | `pdf-page-numbers` | PDF | PDF | iLovePDF |
| Reparar PDF | `pdf-repair` | PDF | PDF | iLovePDF |
| Editar PDF | `pdf-edit` | PDF | PDF | iLovePDF |

## Como ler o catalogo

Cada definicao em `src/catalog.ts` inclui:

- `id`
- `label`
- `shortLabel`
- `access`
- `inputKinds`
- `outputExtension`
- `outputMime`
- `category`
- `headline`
- `description`
- `providerHint`
- `accept`
- `fileHint`
- `optionFields`

Isso alimenta:

- UI da home
- busca
- filtros
- workspace por ferramenta
- validacao de upload
- hints de conversao
