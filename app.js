import fs from 'node:fs';
import { downloadURL, getHTML, jQuery, parseJS, postFormData, query } from './http.js';

function createFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

async function getDownloadId(url) {
  const html = await getHTML(url);
  const $ = jQuery(html);
  return $('div#tableContainer table tr#headerRow + tr input[id][type="button"][value="Download"]').attr('id');
}

async function downloadUpdate(updateID) {
  const html = await postFormData('https://www.catalog.update.microsoft.com/DownloadDialog.aspx', new URLSearchParams({ updateIDs: JSON.stringify([{ updateID }]) }));
  const $ = jQuery(html);
  const script = $('script[language="javascript"][type="text/javascript"]').html();
  const context = parseJS(script);
  const title = context.downloadInformation[0].enTitle;

  const downloadFolder = `./../${title}`;
  createFolder(downloadFolder);

  const KB = title
    .split(' ')
    .filter((word) => word.startsWith('(KB'))[0]
    .replace('(', '')
    .replace(')', '')
    .toLowerCase();

  const files = context.downloadInformation[0].files.filter((file) => file.fileName.toLowerCase().includes(KB));
  for (const file of files) {
    console.log(`Downloading ${title}/${file.fileName}...`);
    await downloadURL(file.url, `${downloadFolder}/${file.fileName}`);
  }
}

const search = [
  //
  'Cumulative Update for Windows 11, version 26H2 for x64-based Systems 26300 -Dynamic',
  'Cumulative Update for Windows 10 Version 22H2 for x64-based Systems -Dynamic -server'
];

async function run() {
  for (const q of search) {
    const id = await getDownloadId(`https://www.catalog.update.microsoft.com/Search.aspx?${query({ q })}`);
    await downloadUpdate(id);
  }
}

run();
