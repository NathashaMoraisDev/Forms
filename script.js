function gerarPreview() {
  const form = document.getElementById('formulario');
  const dados = new FormData(form);

  const preview = `
    <p><strong>Orçamento N°:</strong> ${dados.get("orcamento_numero") || ""}</p>
    <p><strong>Cliente:</strong> ${dados.get("cliente") || ""}</p>
    <p><strong>Cond/Razão:</strong> ${dados.get("cond") || ""}</p>
    <p><strong>Bloco:</strong> ${dados.get("bloco") || ""}</p>
    <p><strong>Telefone:</strong> ${dados.get("telefone") || ""}</p>
    <p><strong>E-mail:</strong> ${dados.get("email") || ""}</p>
    <p><strong>Data de instalação:</strong> ${dados.get("data_instalacao") || ""}</p>
    <p><strong>Horário:</strong> ${dados.get("horario") || ""}</p>
    <p><strong>Instalador:</strong> ${dados.get("instalador") || ""}</p>
    <p><strong>Valor mercadoria:</strong> ${dados.get("valor_mercadoria") || ""}</p>
    <p><strong>Desconto:</strong> ${dados.get("desconto") || ""}</p>
    <p><strong>Acrescimo:</strong> ${dados.get("acrescimo") || ""}</p>
    <p><strong>Valor Final:</strong> ${dados.get("valor_final") || ""}</p>
    <p><strong>Observação:</strong><br>${(dados.get("observacao") || "").replace(/\n/g, "<br>")}</p>
    <hr>
    <h3>Itens do orçamento:</h3>
    ${gerarTabelaItens(dados)}
  `;

  document.getElementById("previewContent").innerHTML = preview;
}

function gerarTabelaItens(dados) {
  let html = `
    <table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Qtd</th>
          <th>Serviço</th>
          <th>Descrição</th>
          <th>Código</th>
          <th>Cor</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let i = 1; i <= 4; i++) {
    const qtd = dados.get(`qtd_${i}`);
    const servico = dados.get(`servico_${i}`);
    const desc = dados.get(`desc_${i}`);
    const cod = dados.get(`codigo_${i}`);
    const cor = dados.get(`cor_${i}`);
    const valor = dados.get(`valor_item_${i}`);

    if (qtd || servico || desc || cod || cor || valor) {
      html += `
        <tr>
          <td>${qtd || ""}</td>
          <td>${(servico || "").replace(/\n/g, "<br>")}</td>
          <td>${(desc || "").replace(/\n/g, "<br>")}</td>
          <td>${cod || ""}</td>
          <td>${cor || ""}</td>
          <td>${valor || ""}</td>
        </tr>
      `;
    }
  }

  html += "</tbody></table>";
  return html;
}

function baixarPDF() {
  const preview = document.getElementById("previewContent");
  if (!preview.innerHTML.trim()) {
    alert("Gere o preview antes de baixar o PDF!");
    return;
  }

  const opt = {
    margin: 0.5,
    filename: 'orcamento_editado.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(preview).save();
}


document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("formulario").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(e.target).entries());

  try {
    const existingPdfBytes = await fetch("./59917 -Rosana_250709_153019.pdf.pdf").then(res => {

      if (!res.ok) throw new Error("Falha ao carregar o PDF base.");
      return res.arrayBuffer();
    });

    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

    // Função para centralizar, alinhar à esquerda ou início, e definir tamanho da fonte
    const drawText = (text, x, y, fieldWidth = 100, align = "center", fontSize = 10, maxLines = 1, useBoldFont = false) => {
      if (text) {
        const selectedFont = useBoldFont ? boldFont : font;
        const textStr = text.toString();
        
        // Quebra o texto por linhas (\n) e por tamanho máximo
        const allLines = [];
        const originalLines = textStr.split('\n');
        
        for (const originalLine of originalLines) {
          if (originalLine.length === 0) {
            allLines.push('');
            continue;
          }
          
          // Quebra linhas muito longas
          const maxCharsPerLine = Math.floor(fieldWidth / (fontSize * 0.25));
          if (originalLine.length <= maxCharsPerLine) {
            allLines.push(originalLine);
          } else {
            const words = originalLine.split(' ');
            let currentLine = '';
            
            for (const word of words) {
              if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word;
              } else {
                if (currentLine) allLines.push(currentLine);
                currentLine = word;
              }
            }
            if (currentLine) allLines.push(currentLine);
          }
        }
        
        // Desenha as linhas
        for (let i = 0; i < Math.min(allLines.length, maxLines); i++) {
          const line = allLines[i];
          let drawX = x;
          
          if (align === "center") {
            const textWidth = selectedFont.widthOfTextAtSize(line, fontSize);
            drawX = x + (fieldWidth - textWidth) / 2;
          } else if (align === "start" || align === "left") {
            drawX = x;
          } else if (align === "end" || align === "right") {
            const textWidth = selectedFont.widthOfTextAtSize(line, fontSize);
            drawX = x + fieldWidth - textWidth;
          }
          
          const currentY = y - (i * (fontSize + 2)); // Espaçamento entre linhas
          
          page.drawText(line, {
            x: drawX, 
            y: currentY, 
            size: fontSize, 
            font: selectedFont,
            color: PDFLib.rgb(0, 0, 0)
          });
        }
      }
    };

    // Dados do cliente (exemplo usando tamanho padrão)
    drawText(form.orcamento_numero, 460, 792, 100, "center", 16, 1, true); // Orçamento N° - Fonte 16, negrito
    drawText(form.cliente, 99, 670, 180, "start", 9, 1, true); // Cliente - negrito
    drawText(form.rua, 99, 661, 180, "start", 9, 1, true); // Rua - negrito
    drawText(form.cidade, 99, 652, 180, "start", 9, 1, true); // Cidade - negrito

    drawText(form.cond, 115, 632, 180, "start", 8); // Cond/Razão2
    drawText(form.bloco, 100, 610, 60, "start", 8); // Bloco
    drawText(form.telefone, 280, 605, 180, "start", 8, 1, true); // Telefone - negrito
    drawText(form.email, 100, 585, 180, "start", 8); // Email
    drawText(form.data_instalacao, 465, 650, 100, "end", 8, 1, true); // Data de instalação - negrito
    drawText(form.horario, 465, 630, 100, "end", 8, 1, true); // Horário - negrito
    drawText(form.instalador, 465, 605, 100, "end", 8, 1, true); // Instalador - negrito
    drawText(form.valor_mercadoria, 465, 555, 100, "end", 8, 1, true); // Valor mercadoria - negrito
    drawText(form.desconto, 465, 534, 100, "end", 8, 1, true); // Desconto - negrito
    drawText(form.acrescimo, 465, 510, 100, "end", 8, 1, true); // Acrescimo - negrito
    drawText(form.valor_final, 465, 475, 100, "end", 8, 1, true); // Valor Final - negrito

    // Observação (alinhado à esquerda, Y ajustado, permitindo múltiplas linhas com texto longo)
    drawText(form.observacao, 115, 560, 400, "start", 8, 8);


      drawText(form[`qtd_1`], 70, 430, 30, "center", 8); // Qtd
      drawText(form[`servico_1`], 105, 438, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_1`], 105, 412, 200, "start", 8, 5); // Descrição (5 linhas para texto longo)
      drawText(form[`codigo_1`], 305, 430, 60, "center", 8); // Código
      drawText(form[`cor_1`], 375, 430, 60, "center", 8); // Cor
      drawText(form[`valor_item_1`], 497, 425, 70, "end", 8); // Valor

      drawText(form[`qtd_2`], 70, 368, 30, "center", 8); // Qtd
      drawText(form[`servico_2`], 105, 370, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_2`], 105, 356, 200, "start", 8, 7); // Descrição (5 linhas para texto longo)
      drawText(form[`codigo_2`], 305, 368, 60, "center", 8); // Código
      drawText(form[`cor_2`], 375, 368, 60, "center", 8); // Cor
      drawText(form[`valor_item_2`], 497, 368, 70, "end", 8); // Valor

      
      drawText(form[`qtd_3`], 70, 284, 30, "center", 8); // Qtd
      drawText(form[`servico_3`], 105, 286, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_3`], 105, 267, 200, "start", 8, 7); // Descrição (5 linhas para texto longo)
      drawText(form[`codigo_3`], 305, 283, 60, "center", 8); // Código
      drawText(form[`cor_3`], 375, 283, 60, "center", 8); // Cor
      drawText(form[`valor_item_3`], 497, 283, 70, "end", 8); // Valor

      drawText(form[`qtd_4`], 70, 190, 30, "center", 8); // Qtd
      drawText(form[`servico_4`], 105, 191, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_4`], 105, 178, 200, "start", 8, 7); // Descrição (5 linhas para texto longo)
      drawText(form[`codigo_4`], 305, 190, 60, "center", 8); // Código
      drawText(form[`cor_4`], 375, 190, 60, "center", 8); // Cor
      drawText(form[`valor_item_4`], 497, 190, 70, "end", 8); // Valor

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orcamento_nish_editado.pdf";
    link.click();
  } catch (error) {
    alert("Erro ao gerar o PDF: " + error.message);
    console.error(error);
  }
  });

  // Gera PDF ao pressionar Enter no formulário
  document.getElementById("formulario").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("formulario").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  });
});
