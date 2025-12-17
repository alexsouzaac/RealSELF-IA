
import { jsPDF } from "jspdf";
import { ViralStrategyResult, ContentCreationResult, ConsultingResult, PricingPlan, LogoIdentityResult } from "../types";

// --- CONFIGURAÇÕES GERAIS DE LAYOUT ---
const COMPANY_NAME = "ALEX SOUZA Agencia de Marketing e Criação de Conteúdo";
const MARGIN_TOP = 30; 
const MARGIN_BOTTOM = 25; 
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const PAGE_HEIGHT = 297; // A4 Altura
const PAGE_WIDTH = 210;  // A4 Largura
// Largura útil para texto (Total - Margens)
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; 

// --- PALETA DE CORES (DARK MODE COMPATIBLE) ---
const COLORS = {
  PRIMARY: [15, 23, 42],    // Slate 950
  ACCENT: [217, 119, 6],    // Amber 600
  BG_DARK: [2, 6, 23],      // Slate 950 (Deep)
  CARD_BG: [30, 41, 59],    // Slate 800
  TEXT_MAIN: [51, 65, 85],  // Slate 700 (Para fundo claro)
  TEXT_LIGHT: [248, 250, 252], // Slate 50 (Para fundo escuro)
  TEXT_MUTED: [148, 163, 184]  // Slate 400
};

// --- UTILITÁRIOS DE TEXTO ---

const cleanText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') 
    .replace(/\u00A0/g, ' ') 
    .replace(/[^\x20-\x7E\xC0-\xFF\n\r]/g, "") 
    .trim();
};

const sanitizeFilename = (text: string): string => {
  return text.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

// --- FUNÇÕES DE DESENHO E CONTROLE DE PÁGINA ---

const checkPageBreak = (doc: jsPDF, currentY: number, neededHeight: number, isDark: boolean = false): number => {
    const limit = PAGE_HEIGHT - MARGIN_BOTTOM;
    if (currentY + neededHeight > limit) {
        doc.addPage();
        if (isDark) {
            doc.setFillColor(COLORS.BG_DARK[0], COLORS.BG_DARK[1], COLORS.BG_DARK[2]);
            doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
        }
        return MARGIN_TOP;
    }
    return currentY;
};

const drawHeader = (doc: jsPDF, isDark: boolean = false) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        if (isDark) {
             doc.setFillColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
             doc.rect(0, 0, PAGE_WIDTH, 20, 'F');
             doc.setTextColor(255, 255, 255);
        } else {
             doc.setFillColor(255, 255, 255);
             doc.rect(0, 0, PAGE_WIDTH, 20, 'F');
             doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9); 
        doc.text(COMPANY_NAME.toUpperCase(), PAGE_WIDTH / 2, 13, { align: "center" });

        // Linha divisória
        doc.setDrawColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
        doc.setLineWidth(0.5);
        doc.line(0, 20, PAGE_WIDTH, 20);
    }
};

const drawFooter = (doc: jsPDF, isDark: boolean = false) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const yFooter = PAGE_HEIGHT - 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(isDark ? 100 : 150);
        
        doc.text(`Gerado via RealSelf AI`, MARGIN_LEFT, yFooter);
        doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, yFooter, { align: "right" });
    }
};

// --- COMPONENTES ESPECÍFICOS ---

// Bloco de texto com fundo (Usado em Consultoria/Estratégia)
const drawContentBlock = (doc: jsPDF, title: string, content: string | string[], y: number): number => {
    const padding = 8;
    const textAreaWidth = CONTENT_WIDTH - (padding * 2);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let textLines: string[] = [];
    if (Array.isArray(content)) {
        content.forEach(item => {
            const lines = doc.splitTextToSize("• " + cleanText(item), textAreaWidth);
            textLines = textLines.concat(lines);
        });
    } else {
        textLines = doc.splitTextToSize(cleanText(content), textAreaWidth);
    }
    
    const lineHeight = 5;
    const blockHeight = (textLines.length * lineHeight) + (padding * 2) + 10; // +10 para título
    
    y = checkPageBreak(doc, y, blockHeight);

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.text(title.toUpperCase(), MARGIN_LEFT, y + 5);
    
    // Box Fundo
    const boxY = y + 8;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(MARGIN_LEFT, boxY, CONTENT_WIDTH, (textLines.length * lineHeight) + (padding * 2), 2, 2, 'FD');

    // Texto
    doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let currentTextY = boxY + padding + 4;
    textLines.forEach(line => {
        doc.text(line, MARGIN_LEFT + padding, currentTextY);
        currentTextY += lineHeight;
    });

    return boxY + (textLines.length * lineHeight) + (padding * 2) + 8;
};

// --- BRAND BOOK (MANUAL DA MARCA) ---

export const generateBrandBookPDF = (identity: LogoIdentityResult, logoImage: string) => {
    const doc = new jsPDF();
    doc.setProperties({ title: `Brand Book - ${identity.brandName}`, author: COMPANY_NAME });

    const setDarkBackground = () => {
        doc.setFillColor(COLORS.BG_DARK[0], COLORS.BG_DARK[1], COLORS.BG_DARK[2]);
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    };
    
    // --- CAPA ---
    setDarkBackground();
    let y = MARGIN_TOP + 20;

    // Imagem do Logo
    const logoSize = 90;
    const logoX = (PAGE_WIDTH - logoSize) / 2;
    try {
        doc.addImage(logoImage, 'PNG', logoX, y, logoSize, logoSize, undefined, 'FAST');
    } catch (e) {
        console.error("Erro imagem PDF", e);
    }
    
    y += logoSize + 25;

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(cleanText(identity.brandName).toUpperCase(), PAGE_WIDTH / 2, y, { align: "center" });
    y += 12;

    // Tagline
    doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(cleanText(identity.tagline).toUpperCase(), PAGE_WIDTH / 2, y, { align: "center" });
    y += 15;

    // Story
    doc.setTextColor(COLORS.TEXT_MUTED[0], COLORS.TEXT_MUTED[1], COLORS.TEXT_MUTED[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const storyLines = doc.splitTextToSize(cleanText(identity.story), 120);
    doc.text(storyLines, PAGE_WIDTH / 2, y, { align: "center" });

    // --- PÁGINA 2: ESTRATÉGIA ---
    doc.addPage();
    setDarkBackground();
    y = MARGIN_TOP;

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ESTRATÉGIA DE MARCA", MARGIN_LEFT, y);
    y += 15;

    // --- CARD ARQUÉTIPO (AUTO HEIGHT) ---
    const cardPadding = 10;
    const cardWidth = CONTENT_WIDTH;
    const textWidth = cardWidth - (cardPadding * 2);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const archDescLines = doc.splitTextToSize(cleanText(identity.brandArchetype.description), textWidth);
    
    // Altura: PaddingTop + Title + Name + Gap + DescLines + PaddingBottom
    const archHeight = cardPadding + 5 + 7 + 5 + (archDescLines.length * 5) + cardPadding;
    
    doc.setFillColor(COLORS.CARD_BG[0], COLORS.CARD_BG[1], COLORS.CARD_BG[2]);
    doc.setDrawColor(51, 65, 85);
    doc.roundedRect(MARGIN_LEFT, y, cardWidth, archHeight, 3, 3, 'FD');
    
    // Conteúdo Card
    let innerY = y + cardPadding + 4;
    doc.setTextColor(COLORS.TEXT_MUTED[0], COLORS.TEXT_MUTED[1], COLORS.TEXT_MUTED[2]);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("ARQUÉTIPO", MARGIN_LEFT + cardPadding, innerY);
    
    innerY += 6;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(cleanText(identity.brandArchetype.name), MARGIN_LEFT + cardPadding, innerY);
    
    innerY += 7;
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    archDescLines.forEach(line => {
        doc.text(line, MARGIN_LEFT + cardPadding, innerY);
        innerY += 5;
    });
    
    y += archHeight + 10;

    // --- CARD TIPOGRAFIA ---
    const typoTipLines = doc.splitTextToSize(cleanText(identity.typography.usageTip), textWidth);
    const typoHeight = cardPadding + 30 + 10 + (typoTipLines.length * 5) + cardPadding; // Estimatativa segura
    
    y = checkPageBreak(doc, y, typoHeight, true);

    doc.setFillColor(COLORS.CARD_BG[0], COLORS.CARD_BG[1], COLORS.CARD_BG[2]);
    doc.roundedRect(MARGIN_LEFT, y, cardWidth, typoHeight, 3, 3, 'FD');
    
    innerY = y + cardPadding + 4;
    doc.setTextColor(COLORS.TEXT_MUTED[0], COLORS.TEXT_MUTED[1], COLORS.TEXT_MUTED[2]);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("TIPOGRAFIA", MARGIN_LEFT + cardPadding, innerY);
    
    innerY += 10;
    // Fontes
    doc.setTextColor(148, 163, 184); doc.setFontSize(8); doc.text("PRIMÁRIA", MARGIN_LEFT + cardPadding, innerY);
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(cleanText(identity.typography.primaryFont), MARGIN_LEFT + cardPadding + 30, innerY);
    
    innerY += 10;
    doc.setTextColor(148, 163, 184); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("SECUNDÁRIA", MARGIN_LEFT + cardPadding, innerY);
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(cleanText(identity.typography.secondaryFont), MARGIN_LEFT + cardPadding + 30, innerY);

    innerY += 12;
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.1);
    doc.line(MARGIN_LEFT + cardPadding, innerY - 5, PAGE_WIDTH - MARGIN_RIGHT - cardPadding, innerY - 5);
    
    doc.setTextColor(203, 213, 225); doc.setFontSize(9); doc.setFont("helvetica", "italic");
    typoTipLines.forEach(line => {
        doc.text(line, MARGIN_LEFT + cardPadding, innerY);
        innerY += 5;
    });

    y += typoHeight + 10;

    // --- PALETA DE CORES ---
    const paletteHeight = 50;
    y = checkPageBreak(doc, y, paletteHeight, true);
    
    // Título Paleta
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("PALETA DE CORES", MARGIN_LEFT, y);
    y += 8;

    const colorBoxWidth = (CONTENT_WIDTH - 30) / 4;
    const colorBoxHeight = 30;
    
    identity.colorPalette.forEach((color, i) => {
        const cx = MARGIN_LEFT + (i * (colorBoxWidth + 10));
        
        // Cor
        const rgb = hexToRgb(color.hex);
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.setDrawColor(255, 255, 255);
        doc.rect(cx, y, colorBoxWidth, colorBoxHeight, 'F');
        
        // Hex
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("courier", "bold");
        doc.text(color.hex.toUpperCase(), cx, y + colorBoxHeight + 5);
        
        // Nome
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        // Truncar nome se muito longo
        const cleanName = cleanText(color.name).substring(0, 15);
        doc.text(cleanName, cx, y + colorBoxHeight + 9);
    });
    
    y += colorBoxHeight + 20;

    // --- LISTAS FINAIS (COM QUEBRA DE PÁGINA) ---
    const drawListSection = (title: string, items: string[]) => {
        y = checkPageBreak(doc, y, 20, true);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), MARGIN_LEFT, y);
        y += 8;

        doc.setTextColor(203, 213, 225);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        items.forEach(item => {
            const lines = doc.splitTextToSize("• " + cleanText(item), CONTENT_WIDTH);
            // Verifica se este item cabe na página
            y = checkPageBreak(doc, y, lines.length * 6, true);
            
            lines.forEach((line: string) => {
                doc.text(line, MARGIN_LEFT, y);
                y += 6;
            });
            y += 2; // Espaço extra entre itens
        });
        y += 10;
    };

    drawListSection("Elementos Visuais", identity.visualElements);
    drawListSection("Dicas de Aplicação", identity.applicationTips);

    drawHeader(doc, true);
    drawFooter(doc, true);
    
    doc.save(`BrandBook_${sanitizeFilename(identity.brandName)}.pdf`);
};

// --- CONSULTORIA ESTRATÉGICA (Atualizada para Layout Seguro) ---

export const generateConsultingPDF = (report: ConsultingResult) => {
    const doc = new jsPDF();
    doc.setProperties({ title: `Planejamento - ${report.clientName}`, author: COMPANY_NAME });

    // --- CAPA DARK ---
    doc.setFillColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

    let y = 100;
    
    // Titulo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("PLANEJAMENTO ESTRATÉGICO", PAGE_WIDTH / 2, y, { align: "center" });
    
    y += 20;
    doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
    doc.setFontSize(16);
    // Quebra de linha segura para nome de clientes longos
    const clientNameLines = doc.splitTextToSize(cleanText(report.clientName).toUpperCase(), CONTENT_WIDTH);
    doc.text(clientNameLines, PAGE_WIDTH / 2, y, { align: "center" });

    y += 30;
    doc.setFontSize(10);
    doc.setTextColor(COLORS.TEXT_MUTED[0], COLORS.TEXT_MUTED[1], COLORS.TEXT_MUTED[2]);
    doc.text(new Date().toLocaleDateString('pt-BR'), PAGE_WIDTH / 2, y, { align: "center" });

    // --- MIOLO ---
    doc.addPage();
    let currentY = MARGIN_TOP;

    // Helper interno para adicionar seções de forma limpa
    const addSection = (title: string, content: string | string[]) => {
        if (!content) return;
        currentY = drawContentBlock(doc, title, content, currentY);
    };

    addSection("1. Análise de Mercado", report.marketAnalysis);
    addSection("2. Arquétipo da Marca", report.brandArchetype);
    addSection("3. Direção Visual", report.visualIdentitySuggestion);
    addSection("4. Pilares de Conteúdo", report.contentPillars);
    addSection("5. Estratégia de Crescimento", report.growthStrategy);
    addSection("6. Cronograma Sugerido", report.calendarExample);
    addSection("7. Workflow da Agência", report.agencyWorkflow);

    // --- PREÇOS FORMATADOS (Seguro contra cortes) ---
    if (report.pricingPlans && report.pricingPlans.length > 0) {
        // Título da seção
        currentY = checkPageBreak(doc, currentY, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
        doc.text("8. PROPOSTA DE INVESTIMENTO", MARGIN_LEFT, currentY + 5);
        currentY += 15;

        report.pricingPlans.forEach((plan) => {
            // Formata o conteúdo do plano em uma lista vertical legível
            const planContent = [
                `INVESTIMENTO: ${plan.price}`,
                `${plan.description}`,
                `INCLUSO:`
            ];
            // Adiciona features como sub-itens
            if (plan.features) {
                plan.features.forEach(f => planContent.push(`- ${f}`));
            }

            // Usa drawContentBlock para garantir que o bloco inteiro do plano
            // respeite as margens e quebras de página.
            currentY = drawContentBlock(doc, plan.name.toUpperCase(), planContent, currentY);
            currentY += 2; // Espaço pequeno entre planos
        });
    } else {
        addSection("8. Investimento", report.projectValue || "Sob consulta.");
    }

    drawHeader(doc);
    drawFooter(doc);
    doc.save(`Consultoria_${sanitizeFilename(report.clientName)}.pdf`);
};

// --- OUTROS GERADORES ---

export const generateViralProfilePDF = (strategy: ViralStrategyResult, platform: string) => {
    const doc = new jsPDF();
    let y = MARGIN_TOP;

    y = drawContentBlock(doc, "1. Nomes de Usuário", strategy.usernames, y);
    y = drawContentBlock(doc, "2. Headline", strategy.headline, y);
    y = drawContentBlock(doc, "3. Bio", strategy.bio, y);
    
    const visual = [`Tipografia: ${strategy.typography}`, ...strategy.colorPalette.map(c => `${c.name}: ${c.color}`)];
    y = drawContentBlock(doc, "4. Identidade Visual", visual, y);

    const content = [
        `Feed: ${strategy.contentStrategy.feed}`,
        `Stories: ${strategy.contentStrategy.stories}`,
        `Reels: ${strategy.contentStrategy.reels}`
    ];
    y = drawContentBlock(doc, "5. Estratégia de Conteúdo", content, y);

    drawHeader(doc);
    drawFooter(doc);
    doc.save(`Perfil_${sanitizeFilename(platform)}.pdf`);
};

export const generateContentStrategyPDF = (strategy: ContentCreationResult, topic: string) => {
    const doc = new jsPDF();
    let y = MARGIN_TOP;

    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text("CAMPANHA: " + cleanText(topic).toUpperCase(), MARGIN_LEFT, y);
    y += 15;

    strategy.pieces.forEach((piece, i) => {
        const title = `Peça #${i+1}: ${piece.format}`;
        let details = [
            `Gancho: ${piece.hook}`,
            `Roteiro: ${piece.script}`,
            `Visual: ${piece.visualSuggestion}`,
            `CTA: ${piece.cta}`
        ];

        // Adiciona Slides se houver
        if (piece.slides && piece.slides.length > 0) {
            details.push("--- SLIDES DO CARROSSEL ---");
            piece.slides.forEach(slide => {
                details.push(`[Slide ${slide.slideNumber}] ${slide.title}`);
                details.push(`Conteúdo: ${slide.content}`);
                details.push(`Visual: ${slide.visualPrompt}`);
            });
        }

        // Adiciona Cenas de Vídeo se houver
        if (piece.videoScenes && piece.videoScenes.length > 0) {
             details.push("--- CENAS DE VÍDEO (PROMPTS) ---");
             piece.videoScenes.forEach(scene => {
                 details.push(`[Cena ${scene.sceneNumber}] Ação: ${scene.action}`);
                 details.push(`Prompt Final: ${scene.finalPrompt}`);
             });
        }

        y = drawContentBlock(doc, title, details, y);
    });

    if (strategy.growthTips.length) {
        y = drawContentBlock(doc, "Dicas de Crescimento", strategy.growthTips, y);
    }

    drawHeader(doc);
    drawFooter(doc);
    doc.save(`Campanha_${sanitizeFilename(topic)}.pdf`);
};
