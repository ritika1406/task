import {jsPDF} from "jspdf";
export function exportCsv(rows){
 const header=["Date","Description","Category","Amount","Type"];
 const body=rows.map(r=>[r.transaction_date,r.description,r.category,r.amount,r.transaction_type]);
 const csv=[header,...body].map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="categorized-transactions.csv";a.click();URL.revokeObjectURL(url);
}
export function exportPdf(summary,categories,rows){
 const doc=new jsPDF();let y=18;doc.setFontSize(18);doc.text("Expense Report",14,y);y+=10;doc.setFontSize(10);
 doc.text(`Total expenses: Rs. ${Number(summary?.total_expenses||0).toLocaleString("en-IN")}`,14,y);y+=6;
 doc.text(`Total income: Rs. ${Number(summary?.total_income||0).toLocaleString("en-IN")}`,14,y);y+=10;doc.setFontSize(12);doc.text("Spending by category",14,y);y+=7;doc.setFontSize(9);
 categories.forEach(c=>{doc.text(`${c.category}: Rs. ${Number(c.amount).toLocaleString("en-IN")}`,18,y);y+=5;});y+=5;doc.setFontSize(12);doc.text("Recent transactions",14,y);y+=7;doc.setFontSize(8);
 rows.slice(0,30).forEach(r=>{if(y>280){doc.addPage();y=18;}doc.text(`${String(r.transaction_date).slice(0,10)} | ${r.category} | ${String(r.description).slice(0,40)} | Rs. ${Number(r.amount).toLocaleString("en-IN")}`,14,y);y+=5;});
 doc.save("expense-report.pdf");
}
