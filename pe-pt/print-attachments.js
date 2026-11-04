'use strict';
async function appendPrintFiles(doc,container,files){
  if(!files.length)container.textContent='첨부 파일 없음';
  for(const file of files){
    const title=doc.createElement('h3');
    title.textContent=file.name;
    container.append(title);
    if(typeof file.text==='string'&&/\.csv$/i.test(file.name)){
      const [labels,...rows]=parseReferenceCSV(file.text);
      if(!labels){container.append(doc.createTextNode('표시할 데이터가 없습니다.'));continue;}
      const table=doc.createElement('table');
      table.style.cssText='table-layout:fixed;overflow-wrap:anywhere';
      const header=table.createTHead().insertRow();
      for(const label of labels){
        const cell=doc.createElement('th');
        cell.scope='col';
        cell.textContent=label;
        header.append(cell);
      }
      const body=table.createTBody();
      for(const values of rows){
        const row=body.insertRow();
        for(const value of values)row.insertCell().textContent=value;
      }
      container.append(table);
      continue;
    }
    if(typeof file.text==='string'){
      const text=doc.createElement('pre');
      text.textContent=file.text;
      container.append(text);
      continue;
    }
    const response=await fetch(file.url);
    if(!response.ok)throw Error('파일 읽기 실패');
    const pages=await rasterizePrintPDF(await response.arrayBuffer());
    for(const src of pages){
      const image=doc.createElement('img');
      image.style.cssText='display:block;width:100%;break-inside:avoid';
      image.alt=file.name;
      image.src=src;
      container.append(image);
      await image.decode();
    }
  }
}
function rasterizePrintPDF(buffer){
  return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe');
    frame.hidden=true;
    frame.setAttribute('sandbox','allow-scripts');
    const timeout=setTimeout(()=>finish(Error('PDF 변환 시간 초과')),90000);
    function finish(error,pages){
      clearTimeout(timeout);
      window.removeEventListener('message',receive);
      frame.remove();
      if(error)reject(error);else resolve(pages);
    }
    function receive(event){
      if(event.source!==frame.contentWindow)return;
      if(event.data?.type==='ready')frame.contentWindow.postMessage(buffer,'*',[buffer]);
      if(event.data?.type==='pages')finish(null,event.data.pages);
      if(event.data?.type==='error')finish(Error('PDF 변환 실패'));
    }
    window.addEventListener('message',receive);
    frame.srcdoc='<script type="module">'+
      'try{const base="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/";'+
      'const lib=await import(base+"pdf.mjs");lib.GlobalWorkerOptions.workerSrc=base+"pdf.worker.mjs";'+
      'addEventListener("message",async e=>{if(e.source!==parent)return;try{'+
      'const pdf=await lib.getDocument({data:e.data,isEvalSupported:false}).promise;const pages=[];'+
      'for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const viewport=page.getViewport({scale:1.5});'+
      'const canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);'+
      'await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;pages.push(canvas.toDataURL("image/jpeg",0.9));}'+
      'parent.postMessage({type:"pages",pages},"*");await pdf.destroy();}catch{parent.postMessage({type:"error"},"*");}});'+
      'parent.postMessage({type:"ready"},"*");}catch{parent.postMessage({type:"error"},"*");}'+
      '</script>';
    document.body.append(frame);
  });
}
