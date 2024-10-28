import * as XLSX from 'xlsx';
import pdfToText from 'react-pdftotext'

function analizeExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                console.log(worksheet['!ref']);
                let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                jsonData = jsonData.filter(array => array.length > 0);
                resolve(JSON.stringify(jsonData));  // Resolve the Promise with the jsonData
            } catch (error) {
                reject(error);  // Reject the Promise in case of an error
            }
        };

        reader.readAsArrayBuffer(file);
    });
}

async function analizePdf(file) {
    return new Promise((resolve, reject) => {
    pdfToText(file)
    .then(text => resolve(text))
    .catch(error => reject("Failed to extract text from pdf"+error.message))
    });
}

export { analizeExcel, analizePdf }