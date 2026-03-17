import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

export const exportService = {
  /**
   * Export to Excel
   */
  toExcel(data: Record<string, unknown>[], fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },

  /**
   * Export to PDF
   */
  toPDF(headers: string[], data: (string | number)[][], fileName: string, title: string) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    doc.autoTable({
      startY: 30,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: { fillBlue: [59, 130, 246] },
    });

    doc.save(`${fileName}.pdf`);
  },

  /**
   * Export to Word (simplified)
   */
  async toWord(title: string, content: (string | number)[][], fileName: string) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: 'Heading1',
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: content.map(row => new TableRow({
              children: row.map((cell) => new TableCell({
                children: [new Paragraph(String(cell))],
              })),
            })),
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
