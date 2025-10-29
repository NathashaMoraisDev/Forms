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
    <p><strong>Data de emissão:</strong> ${dados.get("data_emissao") || ""}</p>
    <p><strong>Horário:</strong> ${dados.get("horario") || ""}</p>
    <p><strong>Instalador:</strong> ${dados.get("instalador") || ""}</p>
    <p><strong>Valor mercadoria:</strong> ${dados.get("valor_mercadoria") || ""}</p>
    <p><strong>Desconto:</strong> ${dados.get("desconto") || ""}</p>
    <p><strong>Acrescimo:</strong> ${dados.get("acrescimo") || ""}</p>
    <p><strong>Valor Final:</strong><br>${(dados.get("valor_final") || "").replace(/\n/g, "<br>")}</p>
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

function getForm() {

}



function populateForm(formData) {
  console.log('awd')
  const values = JSON.parse(formData)
    Object.keys(values).forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = values[fieldName] === 'on' || values[fieldName] === true;
        } else {
          field.value = values[fieldName] || '';
        }
      }
    });
}

function getSavedForms() {
  const forms = localStorage.getItem('forms')
  return forms ? JSON.parse(forms) : null;
}
var forms = {}



document.addEventListener("DOMContentLoaded", function () {
  // Garante que o formulário inicie limpo e adiciona ação do botão "Limpar"
  const optionsForm = []
  const selectElement = document.getElementById("select-form");
  for (let i = 0; i < localStorage.length; i++) {
    // Pega a chave pelo índice
    const key = localStorage.key(i);

    // Pega o valor usando a chave
    const value = localStorage.getItem(key);

    forms[key] = value;
    optionsForm.push(key);
    const option = new Option(key, value);
    selectElement.add(option)
  }
   selectElement.addEventListener('change', (e) => {
    console.log("Select changed! Value:", e.target.value); // Debug
    console.log("Value length:", e.target.value.length); // Debug
    populateForm(e.target.value);
  });

  const formularios = getSavedForms()
  function limparFormulario() {
    const form = document.getElementById('formulario');
    if (!form) return;
    // Reset para valores padrão (agora todos vazios)
    form.reset();
    // Limpa explicitamente todos os campos para evitar auto-preenchimento do navegador
    form.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="reset"])').forEach(el => {
      el.value = "";
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    });
    form.querySelectorAll('textarea').forEach(el => el.value = "");
  }

  // Executa limpeza ao carregar a página
  limparFormulario();
  if (localStorage.length == 1) {
    const form = localStorage.getItem(localStorage.key(0))
    console.log(form)
    populateForm(form);
  }
  // Botão Limpar
  const btnLimpar = document.getElementById("limpar");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", function () {
      limparFormulario();
    });
  }

  document.getElementById("formulario").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const form = Object.fromEntries(new FormData(e.target).entries());
    localStorage.setItem(form.cliente, JSON.stringify(form))

    try {
      const existingPdfBytes = await fetch("./Protege Redes Ordem de Serviço.pdf").then(res => {

        if (!res.ok) throw new Error("Falha ao carregar o PDF base.");
        return res.arrayBuffer();
      });

      const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      // Função para centralizar, alinhar à esquerda ou início, e definir tamanho da fonte
      const drawText = (text, x, y, fieldWidth = 100, align = "center", fontSize = 10, maxLines = 1, useBoldFont = false, maxCharsPerLineOverride = null) => {
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
            const maxCharsPerLine = (Number.isFinite(maxCharsPerLineOverride) && maxCharsPerLineOverride > 0)
              ? Math.floor(maxCharsPerLineOverride)
              : Math.floor(fieldWidth / (fontSize * 0.25));
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
      drawText(form.valor_final, 465, 485, 100, "end", 8, 3, true, 25); // Valor Final - negrito, 3 linhas, max 25 chars/linha

      // Observação (alinhado à esquerda, Y ajustado, permitindo múltiplas linhas com texto longo)
      // Limita o comprimento das linhas para melhor encaixe visual (ex.: 70 caracteres por linha)
      drawText(form.observacao, 115, 560, 400, "start", 8, 8, false, 70);


      drawText(form[`qtd_1`], 70, 430, 30, "center", 8); // Qtd
      drawText(form[`servico_1`], 107, 430, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_1`], 105, 412, 420, "start", form[`desc_1`].length < 500 ? 8 : 7, 4, false, form[`desc_1`].length < 500 ? 80 : 147); // Descrição - 127 chars/linha, 5 linhas
      drawText(form[`codigo_1`], 305, 430, 60, "center", 8); // Código
      drawText(form[`cor_1`], 375, 430, 60, "center", 8); // Cor
      drawText(form[`valor_item_1`], 497, 425, 70, "end", 8); // Valor

      drawText(form[`qtd_2`], 70, 368, 30, "center", 8); // Qtd
      drawText(form[`servico_2`], 107, 368, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_2`], 105, 356, 420, "start", form[`desc_2`].length < 500 ? 8 : 7, 7, false, form[`desc_2`].length < 500 ? 80 : 147); // Descrição - 127 chars/linha, 7 linhas
      drawText(form[`codigo_2`], 305, 368, 60, "center", 8); // Código
      drawText(form[`cor_2`], 375, 368, 60, "center", 8); // Cor
      drawText(form[`valor_item_2`], 497, 368, 70, "end", 8); // Valor


      drawText(form[`qtd_3`], 70, 284, 30, "center", 8); // Qtd
      drawText(form[`servico_3`], 107, 284, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_3`], 105, 271, 420, "start", form[`desc_3`].length < 500 ? 8 : 7, 7, false, form[`desc_3`].length < 500 ? 80 : 147); // Descrição - 127 chars/linha, 7 linhas
      drawText(form[`codigo_3`], 305, 283, 60, "center", 8); // Código
      drawText(form[`cor_3`], 375, 283, 60, "center", 8); // Cor
      drawText(form[`valor_item_3`], 497, 283, 70, "end", 8); // Valor

      drawText(form[`qtd_4`], 70, 190, 30, "center", 8); // Qtd
      drawText(form[`servico_4`], 107, 190, 120, "start", 8, 2); // Serviço (permite 2 linhas)
      drawText(form[`desc_4`], 105, 178, 420, "start", form[`desc_4`].length < 500 ? 8 : 7, 7, false, form[`desc_4`].length < 500 ? 80 : 147); // Descrição - 127 chars/linha, 7 linhas
      drawText(form[`codigo_4`], 305, 190, 60, "center", 8); // Código
      drawText(form[`cor_4`], 375, 190, 60, "center", 8); // Cor
      drawText(form[`valor_item_4`], 497, 190, 70, "end", 8); // Valor

      // Rodapé com data de emissão
      if (form.data_emissao) {
        // Converter data do formato YYYY-MM-DD para DD/MM/YYYY
        const dataEmissao = form.data_emissao;
        const [ano, mes, dia] = dataEmissao.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        drawText(dataFormatada, 230, 49, 200, "center", 9, 1, false); // Mais baixo e à esquerda
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${form.cliente}-protege-redes-os`;
      link.click();
    } catch (error) {
      alert("Erro ao gerar o PDF: " + error.message);
      console.error(error);
    }
  });

  // Gera PDF ao pressionar Enter no formulário
  const formEl = document.getElementById("formulario");

  // Em textareas: Enter (com ou sem Shift) NÃO deve submeter o formulário
  // - Shift+Enter: inserimos quebra de linha manualmente
  // - Enter simples: deixamos o comportamento padrão do textarea (quebra de linha)
  formEl.addEventListener("keydown", function (e) {
    const target = e.target;
    const isTextarea = target && target.tagName === 'TEXTAREA';

    // Enter pressionado em textarea
    if (isTextarea && e.key === 'Enter') {
      if (e.shiftKey) {
        // Inserir quebra de linha manual (alguns teclados móveis podem não inserir corretamente)
        e.preventDefault();
        const el = target;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const before = el.value.substring(0, start);
        const after = el.value.substring(end);
        el.value = before + "\n" + after;
        // reposiciona o cursor após a quebra
        const newPos = start + 1;
        el.setSelectionRange?.(newPos, newPos);
      }
      // Para Enter simples em textarea, deixamos o comportamento padrão (inserir nova linha)
      // e retornamos para NÃO acionar o envio por Enter geral
      return;
    }

    // Enter normal (sem Shift) fora de textarea => gerar PDF (comportamento existente)
    if (e.key === 'Enter' && !e.shiftKey && !isTextarea) {
      e.preventDefault();
      formEl.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  });
});
