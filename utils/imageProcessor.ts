/**
 * Utilitário para processamento de imagens no navegador.
 * Remove fundo branco, converte formatos e gera downloads.
 */

export const removeBackground = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Erro ao criar contexto Canvas');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Limiar para considerar "branco" (0-255)
      // Logotipos geralmente têm fundo #FFFFFF puro, mas usamos uma margem.
      const threshold = 230; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Se o pixel for muito claro (branco ou quase branco), torna transparente
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0; // Alpha = 0 (Transparente)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};

export const generateSVG = (base64Image: string, width: number = 1024, height: number = 1024): string => {
  // Cria um SVG que encapsula a imagem base64. 
  // CorelDraw e Illustrator abrem isso como um objeto de bitmap dentro do vetor.
  const svgBody = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <image href="${base64Image}" height="${height}" width="${width}"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svgBody);
};

// Gera um PDF simples contendo a imagem (simulado via estrutura PDF mínima ou apenas a imagem para impressão)
// Como gerar PDF binário puro em JS sem libs pesadas é complexo, 
// vamos focar em garantir que o SVG e PNG sem fundo funcionem perfeitamente,
// pois são os formatos chave para designers.
// O "PDF" aqui será um SVG salvo como PDF (truque comum na web) ou apenas o SVG que navegadores imprimem como PDF.
// Para este exemplo, manteremos foco no PNG transparente e SVG.
