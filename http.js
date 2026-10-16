import jquery from 'jquery';
import { JSDOM } from 'jsdom';
import ky from 'ky';
import fs from 'node:fs';
import { pipeline } from 'stream/promises';
import vm from 'vm';

export function query(query) {
  return new URLSearchParams(query).toString();
}

export async function getHTML(url) {
  const response = await ky.get(url, { timeout: false });
  return await response.text();
}

export async function postFormData(url, body) {
  const response = await ky.post(url, { timeout: false, body });
  return await response.text();
}

export async function downloadURL(url, path) {
  try {
    const response = await ky.get(url, { timeout: false });
    await pipeline(response.body, fs.createWriteStream(path));
    // const buffer = await response.arrayBuffer();
    // await new Promise(function (resolve, _) {
    //   fs.writeFile(path, Buffer.from(buffer), function () {
    //     resolve();
    //   });
    // });
  } catch (e) {
    console.log(e);
  }
}

export function jQuery(html) {
  const { window } = new JSDOM(html);
  return jquery(window);
}

export function parseJS(code) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

export function sleep(n) {
  return new Promise(function (resolve, _) {
    setTimeout(resolve, n);
  });
}
