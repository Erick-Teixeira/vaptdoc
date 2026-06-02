export type SupportedKind =
  | "pdf"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "ppt"
  | "pptx"
  | "odt"
  | "ods"
  | "odp"
  | "jpg"
  | "jpeg"
  | "png"
  | "tif"
  | "tiff"
  | "html"
  | "mp4"
  | "stl"
  | "obj"
  | "3mf"
  | "step"
  | "fbx"
  | "dae"
  | "amf"
  | "ply"
  | "glb"
  | "gltf"
  | "3ds"
  | "u3d"
  | "drc"
  | "rvm"
  | "usd"
  | "usdz";

export interface ToolOptionChoice {
  value: string;
  label: string;
}

export interface ToolOptionVisibility {
  field: string;
  values: string[];
}

export interface ToolOptionField {
  name: string;
  type: "select" | "text" | "password" | "number" | "checkbox";
  label: string;
  placeholder?: string;
  help?: string;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  choices?: ToolOptionChoice[];
  fullWidth?: boolean;
  showWhen?: ToolOptionVisibility;
}

export interface ToolDefinition {
  id: string;
  label: string;
  shortLabel: string;
  access?: "free" | "pro";
  inputKinds: readonly SupportedKind[];
  outputExtension: string;
  outputMime: string;
  category: string;
  accent: string;
  headline: string;
  description: string;
  providerHint: string;
  accept: string;
  allowsMultipleFiles?: boolean;
  minFiles?: number;
  maxFiles?: number;
  fileHint?: string;
  textLayoutSupport?: {
    enabled: boolean;
    defaultMode: "blocks" | "lines";
  };
  optionFields?: ToolOptionField[];
}

export const toolCatalog = {
  "pdf-to-docx": {
    id: "pdf-to-docx",
    label: "PDF para DOCX",
    shortLabel: "PDF -> DOCX",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "docx",
    outputMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "documentos",
    accent: "coral",
    headline: "Editable OCR workflow",
    description:
      "Converte PDF em DOCX editavel com OCR via iLovePDF quando necessario e recompilacao local orientada a layout.",
    providerHint: "iLovePDF OCR + DOCX local",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para transformar em DOCX editavel.",
    textLayoutSupport: {
      enabled: true,
      defaultMode: "blocks"
    }
  },
  "3d-convert": {
    id: "3d-convert",
    label: "Conversor 3D",
    shortLabel: "3D -> 3D",
    access: "pro",
    inputKinds: ["stl", "obj", "step", "fbx", "dae", "amf", "ply", "glb", "gltf", "3ds", "u3d", "drc", "rvm", "usd", "usdz"],
    outputExtension: "3d",
    outputMime: "application/octet-stream",
    category: "3d",
    accent: "sky",
    headline: "Impressao 3D e modelos",
    description:
      "Converte modelos 3D e arquivos de impressao com motor Aspose 3D dedicado e fallback cloud quando necessario.",
    providerHint: "Aspose 3D local + cloud",
    accept:
      ".stl,.obj,.step,.stp,.fbx,.dae,.amf,.ply,.glb,.gltf,.3ds,.u3d,.drc,.rvm,.usd,.usdz,model/stl,model/obj,model/gltf-binary,model/gltf+json,model/vnd.collada+xml,application/octet-stream",
    fileHint: "Escolha um modelo 3D para converter para outro formato.",
    optionFields: [
      {
        name: "target3dFormat",
        type: "select",
        label: "Converter para",
        defaultValue: "stl",
        choices: [
          { value: "stl", label: "STL" },
          { value: "obj", label: "OBJ" },
          { value: "fbx", label: "FBX" },
          { value: "glb", label: "GLB" },
          { value: "gltf", label: "GLTF" },
          { value: "dae", label: "DAE / Collada" },
          { value: "ply", label: "PLY" },
          { value: "amf", label: "AMF" },
          { value: "3ds", label: "3DS" },
          { value: "u3d", label: "U3D" },
          { value: "drc", label: "DRC / Draco" },
          { value: "rvm", label: "RVM" },
          { value: "pdf", label: "PDF 3D" }
        ]
      }
    ]
  },
  "docx-to-pdf": {
    id: "docx-to-pdf",
    label: "DOCX para PDF",
    shortLabel: "DOCX -> PDF",
    access: "pro",
    inputKinds: ["docx"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "documentos",
    accent: "amber",
    headline: "Office-grade export",
    description: "Exporta DOCX com alta fidelidade usando iLovePDF e fallback local seguro.",
    providerHint: "iLovePDF Office to PDF",
    accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileHint: "Escolha um DOCX para gerar um PDF pronto para compartilhar."
  },
  "office-to-pdf": {
    id: "office-to-pdf",
    label: "Office para PDF",
    shortLabel: "Office -> PDF",
    access: "pro",
    inputKinds: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "documentos",
    accent: "amber",
    headline: "Broad office support",
    description: "Converte Word, Excel, PowerPoint e OpenDocument em PDF via iLovePDF.",
    providerHint: "iLovePDF Office to PDF",
    accept:
      ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation",
    fileHint: "Escolha um arquivo Office ou OpenDocument para converter em PDF."
  },
  "jpg-to-png": {
    id: "jpg-to-png",
    label: "JPG para PNG",
    shortLabel: "JPG -> PNG",
    inputKinds: ["jpg", "jpeg"],
    outputExtension: "png",
    outputMime: "image/png",
    category: "imagens",
    accent: "cyan",
    headline: "Lossless image swap",
    description: "Converte JPG ou JPEG para PNG usando processamento local com qualidade consistente.",
    providerHint: "Engine local com Sharp",
    accept: ".jpg,.jpeg,image/jpeg",
    fileHint: "Escolha uma imagem JPG ou JPEG."
  },
  "jpeg-to-png": {
    id: "jpeg-to-png",
    label: "JPEG para PNG",
    shortLabel: "JPEG -> PNG",
    inputKinds: ["jpg", "jpeg"],
    outputExtension: "png",
    outputMime: "image/png",
    category: "imagens",
    accent: "cyan",
    headline: "Lossless image swap",
    description: "Mesmo pipeline do JPG para PNG, exposto como ferramenta dedicada para descoberta mais rapida.",
    providerHint: "Engine local com Sharp",
    accept: ".jpg,.jpeg,image/jpeg",
    fileHint: "Escolha uma imagem JPEG."
  },
  "png-to-jpg": {
    id: "png-to-jpg",
    label: "PNG para JPG",
    shortLabel: "PNG -> JPG",
    inputKinds: ["png"],
    outputExtension: "jpg",
    outputMime: "image/jpeg",
    category: "imagens",
    accent: "teal",
    headline: "Compressed export",
    description: "Converte PNG para JPG com compressao controlada e fundo branco para areas transparentes.",
    providerHint: "Engine local com Sharp",
    accept: ".png,image/png",
    fileHint: "Escolha uma imagem PNG."
  },
  "png-to-jpeg": {
    id: "png-to-jpeg",
    label: "PNG para JPEG",
    shortLabel: "PNG -> JPEG",
    inputKinds: ["png"],
    outputExtension: "jpeg",
    outputMime: "image/jpeg",
    category: "imagens",
    accent: "teal",
    headline: "Compressed export",
    description: "Variante da exportacao PNG para JPEG para quem busca nomenclatura explicita.",
    providerHint: "Engine local com Sharp",
    accept: ".png,image/png",
    fileHint: "Escolha uma imagem PNG."
  },
  "mp4-to-mp3": {
    id: "mp4-to-mp3",
    label: "MP4 para MP3",
    shortLabel: "MP4 -> MP3",
    inputKinds: ["mp4"],
    outputExtension: "mp3",
    outputMime: "audio/mpeg",
    category: "audio",
    accent: "lime",
    headline: "Fast audio extraction",
    description: "Extrai audio de MP4 em MP3 com bitrate alto usando FFmpeg em processo isolado.",
    providerHint: "Engine local com FFmpeg",
    accept: ".mp4,video/mp4",
    fileHint: "Escolha um video MP4 para extrair o audio."
  },
  "pdf-to-text": {
    id: "pdf-to-text",
    label: "PDF para texto",
    shortLabel: "PDF -> TXT",
    inputKinds: ["pdf"],
    outputExtension: "txt",
    outputMime: "text/plain; charset=utf-8",
    category: "extracao",
    accent: "sand",
    headline: "Text extraction",
    description: "Extrai texto de PDFs com leitura nativa e OCR automatico para digitalizacoes.",
    providerHint: "Parser local + iLovePDF OCR",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para extrair o texto.",
    textLayoutSupport: {
      enabled: true,
      defaultMode: "blocks"
    }
  },
  "pdf-merge": {
    id: "pdf-merge",
    label: "Unir PDFs",
    shortLabel: "Merge PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "coral",
    headline: "Merge files",
    description: "Junta dois ou mais PDFs em um unico arquivo com a ordem enviada.",
    providerHint: "iLovePDF Merge",
    accept: ".pdf,application/pdf",
    allowsMultipleFiles: true,
    minFiles: 2,
    maxFiles: 10,
    fileHint: "Selecione dois ou mais PDFs na ordem em que deseja unir."
  },
  "pdf-split": {
    id: "pdf-split",
    label: "Dividir PDF",
    shortLabel: "Split PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "zip",
    outputMime: "application/zip",
    category: "pdf",
    accent: "sky",
    headline: "Split pages",
    description: "Divide um PDF por intervalos, por quantidade fixa de paginas ou removendo paginas.",
    providerHint: "iLovePDF Split",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para dividir.",
    optionFields: [
      {
        name: "splitMode",
        type: "select",
        label: "Como dividir",
        defaultValue: "ranges",
        choices: [
          { value: "ranges", label: "Por intervalos" },
          { value: "fixed_range", label: "A cada N paginas" },
          { value: "remove_pages", label: "Remover paginas" }
        ]
      },
      {
        name: "ranges",
        type: "text",
        label: "Intervalos",
        placeholder: "1-3,5-8",
        help: "Use virgulas para separar grupos.",
        showWhen: { field: "splitMode", values: ["ranges"] }
      },
      {
        name: "fixedRange",
        type: "number",
        label: "Paginas por arquivo",
        min: 1,
        max: 500,
        step: 1,
        defaultValue: 2,
        showWhen: { field: "splitMode", values: ["fixed_range"] }
      },
      {
        name: "removePages",
        type: "text",
        label: "Paginas para remover",
        placeholder: "2-4,8",
        help: "O resultado volta como um unico PDF sem essas paginas.",
        showWhen: { field: "splitMode", values: ["remove_pages"] }
      },
      {
        name: "mergeAfter",
        type: "checkbox",
        label: "Unir os intervalos novamente em um unico PDF",
        defaultValue: false,
        showWhen: { field: "splitMode", values: ["ranges"] }
      }
    ]
  },
  "pdf-compress": {
    id: "pdf-compress",
    label: "Compactar PDF",
    shortLabel: "Compress PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "sand",
    headline: "Smaller file size",
    description: "Reduz o tamanho do PDF mantendo o melhor equilibrio possivel entre qualidade e peso.",
    providerHint: "iLovePDF Compress",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para compactar.",
    optionFields: [
      {
        name: "compressionLevel",
        type: "select",
        label: "Nivel de compressao",
        defaultValue: "recommended",
        choices: [
          { value: "low", label: "Baixa compressao" },
          { value: "recommended", label: "Equilibrada" },
          { value: "extreme", label: "Maxima compressao" }
        ]
      }
    ]
  },
  "pdf-ocr": {
    id: "pdf-ocr",
    label: "OCR em PDF",
    shortLabel: "OCR PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "amber",
    headline: "Searchable PDF",
    description: "Converte um PDF escaneado em um PDF pesquisavel com OCR oficial do iLovePDF.",
    providerHint: "iLovePDF OCR PDF",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF escaneado para aplicar OCR."
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    label: "PDF para JPG",
    shortLabel: "PDF -> JPG",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "zip",
    outputMime: "application/zip",
    category: "pdf",
    accent: "coral",
    headline: "Page rendering",
    description: "Converte paginas do PDF em imagens JPG ou extrai as imagens internas do arquivo.",
    providerHint: "iLovePDF PDF to JPG",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para converter em imagens.",
    optionFields: [
      {
        name: "pdfJpgMode",
        type: "select",
        label: "Modo",
        defaultValue: "pages",
        choices: [
          { value: "pages", label: "Renderizar paginas" },
          { value: "extract", label: "Extrair imagens internas" }
        ]
      },
      {
        name: "dpi",
        type: "number",
        label: "Resolucao (DPI)",
        min: 72,
        max: 300,
        step: 1,
        defaultValue: 150,
        showWhen: { field: "pdfJpgMode", values: ["pages"] }
      }
    ]
  },
  "image-to-pdf": {
    id: "image-to-pdf",
    label: "Imagem para PDF",
    shortLabel: "IMG -> PDF",
    access: "pro",
    inputKinds: ["jpg", "jpeg", "png", "tif", "tiff"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "teal",
    headline: "Images to PDF",
    description: "Transforma uma ou varias imagens em PDF usando o conversor oficial do iLovePDF.",
    providerHint: "iLovePDF Image to PDF",
    accept: ".jpg,.jpeg,.png,.tif,.tiff,image/jpeg,image/png,image/tiff",
    allowsMultipleFiles: true,
    minFiles: 1,
    maxFiles: 10,
    fileHint: "Selecione uma ou varias imagens para gerar um PDF.",
    optionFields: [
      {
        name: "imagePdfOrientation",
        type: "select",
        label: "Orientacao",
        defaultValue: "portrait",
        choices: [
          { value: "portrait", label: "Retrato" },
          { value: "landscape", label: "Paisagem" }
        ]
      },
      {
        name: "imagePdfPageSize",
        type: "select",
        label: "Tamanho da pagina",
        defaultValue: "fit",
        choices: [
          { value: "fit", label: "Ajustar ao conteudo" },
          { value: "A4", label: "A4" },
          { value: "letter", label: "Letter" }
        ]
      },
      {
        name: "imagePdfMargin",
        type: "number",
        label: "Margem",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0
      },
      {
        name: "imagePdfMergeAfter",
        type: "checkbox",
        label: "Gerar um unico PDF",
        defaultValue: true
      }
    ]
  },
  "pdf-to-pdfa": {
    id: "pdf-to-pdfa",
    label: "PDF para PDF/A",
    shortLabel: "PDF -> PDF/A",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "sky",
    headline: "Archive-ready PDF",
    description: "Converte seu PDF para um formato PDF/A voltado a preservacao e arquivamento.",
    providerHint: "iLovePDF PDF/A",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para converter em PDF/A.",
    optionFields: [
      {
        name: "pdfaConformance",
        type: "select",
        label: "Conformidade",
        defaultValue: "pdfa-2b",
        choices: [
          { value: "pdfa-1b", label: "PDF/A-1b" },
          { value: "pdfa-1a", label: "PDF/A-1a" },
          { value: "pdfa-2b", label: "PDF/A-2b" },
          { value: "pdfa-2u", label: "PDF/A-2u" },
          { value: "pdfa-2a", label: "PDF/A-2a" },
          { value: "pdfa-3b", label: "PDF/A-3b" },
          { value: "pdfa-3u", label: "PDF/A-3u" },
          { value: "pdfa-3a", label: "PDF/A-3a" }
        ]
      },
      {
        name: "allowDowngrade",
        type: "checkbox",
        label: "Permitir ajuste automatico de conformidade",
        defaultValue: true
      }
    ]
  },
  "html-to-pdf": {
    id: "html-to-pdf",
    label: "HTML para PDF",
    shortLabel: "HTML -> PDF",
    access: "pro",
    inputKinds: ["html"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "documentos",
    accent: "amber",
    headline: "Web to PDF",
    description: "Converte um arquivo HTML em PDF usando a ferramenta oficial do iLovePDF.",
    providerHint: "iLovePDF HTML to PDF",
    accept: ".html,.htm,text/html",
    fileHint: "Escolha um arquivo HTML para converter em PDF.",
    optionFields: [
      {
        name: "htmlSinglePage",
        type: "checkbox",
        label: "Tentar gerar em pagina unica",
        defaultValue: false
      },
      {
        name: "htmlPageSize",
        type: "select",
        label: "Tamanho da pagina",
        defaultValue: "A4",
        choices: [
          { value: "A3", label: "A3" },
          { value: "A4", label: "A4" },
          { value: "A5", label: "A5" },
          { value: "A6", label: "A6" },
          { value: "Letter", label: "Letter" }
        ]
      },
      {
        name: "htmlPageOrientation",
        type: "select",
        label: "Orientacao",
        defaultValue: "portrait",
        choices: [
          { value: "portrait", label: "Retrato" },
          { value: "landscape", label: "Paisagem" }
        ]
      },
      {
        name: "htmlPageMargin",
        type: "number",
        label: "Margem",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 12
      }
    ]
  },
  "pdf-validate-pdfa": {
    id: "pdf-validate-pdfa",
    label: "Validar PDF/A",
    shortLabel: "Validate PDF/A",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "json",
    outputMime: "application/json; charset=utf-8",
    category: "pdf",
    accent: "sky",
    headline: "Compliance report",
    description: "Gera um relatorio de conformidade PDF/A em vez de converter o arquivo.",
    providerHint: "iLovePDF Validate PDF/A",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para validar em PDF/A.",
    optionFields: [
      {
        name: "validatePdfaConformance",
        type: "select",
        label: "Conformidade esperada",
        defaultValue: "pdfa-2b",
        choices: [
          { value: "pdfa-1b", label: "PDF/A-1b" },
          { value: "pdfa-1a", label: "PDF/A-1a" },
          { value: "pdfa-2b", label: "PDF/A-2b" },
          { value: "pdfa-2u", label: "PDF/A-2u" },
          { value: "pdfa-2a", label: "PDF/A-2a" },
          { value: "pdfa-3b", label: "PDF/A-3b" },
          { value: "pdfa-3u", label: "PDF/A-3u" },
          { value: "pdfa-3a", label: "PDF/A-3a" }
        ]
      }
    ]
  },
  "pdf-rotate": {
    id: "pdf-rotate",
    label: "Girar PDF",
    shortLabel: "Rotate PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "teal",
    headline: "Quick rotation",
    description: "Gira todas as paginas do PDF de forma uniforme.",
    providerHint: "iLovePDF Rotate",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para girar.",
    optionFields: [
      {
        name: "rotateAngle",
        type: "select",
        label: "Rotacao",
        defaultValue: "90",
        choices: [
          { value: "90", label: "90 graus" },
          { value: "180", label: "180 graus" },
          { value: "270", label: "270 graus" }
        ]
      }
    ]
  },
  "pdf-unlock": {
    id: "pdf-unlock",
    label: "Desbloquear PDF",
    shortLabel: "Unlock PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "seguranca",
    accent: "sky",
    headline: "Remove password",
    description: "Remove a senha de abertura de um PDF quando voce possui a senha atual.",
    providerHint: "iLovePDF Unlock",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF protegido e informe a senha atual, se houver.",
    optionFields: [
      {
        name: "pdfPassword",
        type: "password",
        label: "Senha atual do PDF",
        placeholder: "Digite a senha atual do arquivo"
      }
    ]
  },
  "pdf-protect": {
    id: "pdf-protect",
    label: "Proteger PDF",
    shortLabel: "Protect PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "seguranca",
    accent: "coral",
    headline: "Add password",
    description: "Adiciona uma senha de abertura ao PDF.",
    providerHint: "iLovePDF Protect",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF e defina uma nova senha.",
    optionFields: [
      {
        name: "protectPassword",
        type: "password",
        label: "Nova senha",
        placeholder: "Minimo de 4 caracteres"
      }
    ]
  },
  "pdf-watermark": {
    id: "pdf-watermark",
    label: "Marca d'agua",
    shortLabel: "Watermark PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "amber",
    headline: "Stamped branding",
    description: "Aplica uma marca d'agua em texto com foco no branding do seu site.",
    providerHint: "iLovePDF Watermark",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para aplicar a marca d'agua.",
    optionFields: [
      {
        name: "watermarkText",
        type: "text",
        label: "Texto da marca d'agua",
        defaultValue: "vaptdoc",
        placeholder: "vaptdoc"
      },
      {
        name: "watermarkPages",
        type: "text",
        label: "Paginas",
        placeholder: "Todas ou ex.: 1-3,5",
        help: "Deixe vazio para aplicar em todas."
      },
      {
        name: "watermarkVerticalPosition",
        type: "select",
        label: "Posicao vertical",
        defaultValue: "middle",
        choices: [
          { value: "top", label: "Topo" },
          { value: "middle", label: "Meio" },
          { value: "bottom", label: "Rodape" }
        ]
      },
      {
        name: "watermarkHorizontalPosition",
        type: "select",
        label: "Posicao horizontal",
        defaultValue: "center",
        choices: [
          { value: "left", label: "Esquerda" },
          { value: "center", label: "Centro" },
          { value: "right", label: "Direita" }
        ]
      },
      {
        name: "watermarkRotation",
        type: "number",
        label: "Rotacao",
        min: 0,
        max: 360,
        step: 1,
        defaultValue: 315
      },
      {
        name: "watermarkTransparency",
        type: "number",
        label: "Opacidade",
        min: 1,
        max: 100,
        step: 1,
        defaultValue: 40
      }
    ]
  },
  "pdf-page-numbers": {
    id: "pdf-page-numbers",
    label: "Numerar paginas",
    shortLabel: "Page Numbers",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "sky",
    headline: "Page numbering",
    description: "Adiciona numeracao automatica ao PDF.",
    providerHint: "iLovePDF Page Numbers",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para adicionar numeros de pagina.",
    optionFields: [
      {
        name: "pageNumbersStartingNumber",
        type: "number",
        label: "Iniciar em",
        min: 1,
        max: 9999,
        step: 1,
        defaultValue: 1
      },
      {
        name: "pageNumbersPages",
        type: "text",
        label: "Paginas",
        placeholder: "Todas ou ex.: 1-3,5",
        help: "Deixe vazio para numerar todas."
      },
      {
        name: "pageNumbersVerticalPosition",
        type: "select",
        label: "Posicao vertical",
        defaultValue: "bottom",
        choices: [
          { value: "top", label: "Topo" },
          { value: "bottom", label: "Rodape" }
        ]
      },
      {
        name: "pageNumbersHorizontalPosition",
        type: "select",
        label: "Posicao horizontal",
        defaultValue: "center",
        choices: [
          { value: "left", label: "Esquerda" },
          { value: "center", label: "Centro" },
          { value: "right", label: "Direita" }
        ]
      },
      {
        name: "pageNumbersText",
        type: "text",
        label: "Texto opcional",
        placeholder: "Ex.: Pagina"
      }
    ]
  },
  "pdf-repair": {
    id: "pdf-repair",
    label: "Reparar PDF",
    shortLabel: "Repair PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "teal",
    headline: "Repair damaged files",
    description: "Tenta recuperar um PDF corrompido ou com estrutura inconsistente.",
    providerHint: "iLovePDF Repair",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para reparar."
  },
  "pdf-extract": {
    id: "pdf-extract",
    label: "Extracao avancada",
    shortLabel: "Extract PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "txt",
    outputMime: "text/plain; charset=utf-8",
    category: "extracao",
    accent: "sand",
    headline: "Detailed extraction",
    description: "Extrai texto nativo do PDF pela API oficial do iLovePDF, com opcao de CSV detalhado.",
    providerHint: "iLovePDF Extract",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para extracao textual detalhada.",
    optionFields: [
      {
        name: "extractDetailed",
        type: "checkbox",
        label: "Gerar CSV detalhado",
        defaultValue: false
      },
      {
        name: "extractByWord",
        type: "checkbox",
        label: "Separar por palavra",
        defaultValue: false,
        showWhen: { field: "extractDetailed", values: ["true"] }
      }
    ]
  },
  "pdf-edit": {
    id: "pdf-edit",
    label: "Editar PDF",
    shortLabel: "Edit PDF",
    access: "pro",
    inputKinds: ["pdf"],
    outputExtension: "pdf",
    outputMime: "application/pdf",
    category: "pdf",
    accent: "amber",
    headline: "Stamp custom text",
    description: "Insere um texto editavel em posicao predefinida no PDF usando o editor do iLovePDF.",
    providerHint: "iLovePDF Edit PDF",
    accept: ".pdf,application/pdf",
    fileHint: "Escolha um PDF para inserir texto editavel.",
    optionFields: [
      {
        name: "editText",
        type: "text",
        label: "Texto para inserir",
        defaultValue: "Editado com vaptdoc",
        placeholder: "Digite o texto que sera inserido",
        fullWidth: true
      },
      {
        name: "editPages",
        type: "text",
        label: "Paginas",
        placeholder: "1 ou 1-3",
        help: "Deixe vazio para aplicar na primeira pagina."
      },
      {
        name: "editPosition",
        type: "select",
        label: "Posicao",
        defaultValue: "bottom-center",
        choices: [
          { value: "top-left", label: "Topo esquerdo" },
          { value: "top-center", label: "Topo centro" },
          { value: "top-right", label: "Topo direito" },
          { value: "middle-center", label: "Centro" },
          { value: "bottom-left", label: "Rodape esquerdo" },
          { value: "bottom-center", label: "Rodape centro" },
          { value: "bottom-right", label: "Rodape direito" }
        ]
      },
      {
        name: "editOpacity",
        type: "number",
        label: "Opacidade",
        min: 1,
        max: 100,
        step: 1,
        defaultValue: 85
      },
      {
        name: "editRotation",
        type: "number",
        label: "Rotacao",
        min: 0,
        max: 360,
        step: 1,
        defaultValue: 0
      }
    ]
  }
} as const satisfies Record<string, ToolDefinition>;

export type ToolId = keyof typeof toolCatalog;
export const toolList = Object.values(toolCatalog);
