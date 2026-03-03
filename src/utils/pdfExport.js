import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Universal PDF Exporter for MedicarePro Data Tables
 * 
 * @param {string} title - The title of the report (e.g. "Pharmacy Sales Report")
 * @param {Array<string>} columns - The array of column headers
 * @param {Array<Array<any>>} data - The array of rows matching the columns
 * @param {string} filename - The filename to save as (e.g. "Sales_Report")
 */
export const exportTableToPDF = (title, columns, data, filename) => {
    try {
        if (!data || data.length === 0) {
            toast.error('No data available to export.');
            return false;
        }

        const doc = new jsPDF();

        // 1. Add Brand Header
        doc.setFillColor(30, 90, 168); // Primary brand color (#1E5AA8)
        doc.rect(0, 0, 210, 22, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('MediCarePro', 14, 15);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Enterprise Hospital Management', 200 - doc.getTextWidth('Enterprise Hospital Management') - 4, 15);

        // 2. Add Report Title & Metadata
        doc.setTextColor(31, 41, 51); // Text-1 color
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 34);

        const dateStr = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 124, 147); // Text-3 color
        doc.text(`Generated: ${dateStr}`, 14, 40);
        doc.text(`Total Records: ${data.length}`, 14, 45);

        // Map all data to strings to prevent jspdf-autotable from crashing on numbers or objects
        const safeData = data.map(row => row.map(cell => String(cell ?? '')));

        // 3. Generate AutoTable
        autoTable(doc, {
            startY: 52,
            head: [columns],
            body: safeData,
            theme: 'grid',
            headStyles: {
                fillColor: [244, 247, 250], // bg-panel
                textColor: [31, 41, 51],    // text-1
                fontSize: 10,
                fontStyle: 'bold',
                lineColor: [226, 232, 240], // border
                lineWidth: 0.1,
            },
            bodyStyles: {
                textColor: [62, 76, 89],    // text-2
                fontSize: 9.5,
                lineColor: [226, 232, 240], // border
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: [250, 251, 252] // slightly off-white for striping
            },
            styles: {
                cellPadding: 4,
            },
            margin: { top: 52, left: 14, right: 14, bottom: 20 },
            // Add a footer pager
            didDrawPage: function (data) {
                // Footer
                const str = 'Page ' + doc.internal.getNumberOfPages();
                const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.getHeight ? doc.internal.pageSize.getHeight() : doc.internal.pageSize.height;

                doc.setFontSize(8);
                doc.setTextColor(157, 171, 190);
                doc.text(
                    str,
                    data.settings.margin.left,
                    pageHeight - 10
                );
                doc.text(
                    'Confidential Medical Record',
                    pageWidth - data.settings.margin.right - doc.getTextWidth('Confidential Medical Record'),
                    pageHeight - 10
                );
            },
        });

        // 4. Save and return true
        doc.save(`${filename}_${Date.now()}.pdf`);
        toast.success(`${title} exported successfully!`, { icon: '📄' });
        return true;

    } catch (error) {
        console.error('PDF Export Error:', error);
        toast.error(`Export Error: ${error.message || 'Failed to generate PDF document.'}`);
        return false;
    }
};
