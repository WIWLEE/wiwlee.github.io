'use strict';
function makeReferenceTable(doc,text){
  const [labels,...rows]=parseReferenceCSV(text);
  const table=doc.createElement('table');
  table.className='inline-reference-table';
  if(!labels)return table;
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
  return table;
}
function referenceImage(file){
  return typeof file.image==='string'&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(file.image);
}
function appendReferencePreview(file){
  if(referenceImage(file)){
    const figure=document.createElement('figure');
    figure.className='reference-image';
    const image=document.createElement('img');
    image.src=file.image;
    image.alt=file.text||file.name;
    const link=document.createElement('a');
    link.href=file.image;
    link.download=file.name;
    link.textContent='이미지 다운로드 ↓';
    const caption=document.createElement('figcaption');
    caption.textContent=file.text||file.name;
    figure.append(image,caption,link);
    $('files').append(figure);
  }else if(typeof file.text==='string'&&/\.csv$/i.test(file.name)){
    const details=document.createElement('details');
    details.className='reference-preview';
    details.open=true;
    const summary=document.createElement('summary');
    summary.textContent='데이터 표 · '+file.name;
    const scroll=document.createElement('div');
    scroll.className='inline-table-scroll';
    scroll.tabIndex=0;
    scroll.setAttribute('aria-label',file.name+' 데이터 표');
    scroll.append(makeReferenceTable(document,file.text));
    details.append(summary,scroll);
    $('files').append(details);
  }
}
async function generateReferenceImage(data,key,signal){
  const response=await fetch('https://api.openai.com/v1/images/generations',{
    method:'POST',signal,
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},
    body:JSON.stringify({
      model:'gpt-image-2',n:1,size:'1024x1024',quality:'low',
      output_format:'jpeg',output_compression:65,
      prompt:'반도체 신입 직무 모의 시험의 공정/소자 관찰 참고 이미지다. 아래 묘사대로 공정 단면 또는 소자 구조를 보여주는 교육용 합성 관찰 이미지를 만들어라. 실제 회사 로고나 출처를 넣지 마라. 판정, 정답, 화살표로 표시한 원인, 수치, 스케일바를 추가하지 마라. 이미지 안 글자는 없이 구성하고 묘사에 없는 결함은 추가하지 마라. 이 그림은 정성적 관찰용이며 수치 분석은 별도 CSV로 제공된다.\n'+data.visual.prompt
    })
  });
  if(!response.ok)throw Error('이미지 생성 HTTP '+response.status+' · 이미지 모델 접근 권한·API 잔액을 확인하거나 이미지 첨부 옵션을 끄고 다시 생성하세요.');
  const result=await response.json();
  const base64=result.data?.[0]?.b64_json;
  if(typeof base64!=='string'||!base64||!/^[A-Za-z0-9+/=\r\n]+$/.test(base64)||base64.length>2500000)throw Error('이미지 응답이 없거나 저장 한도를 초과했습니다. 다시 생성하세요.');
  return {
    name:'visual_reference.jpg',
    image:'data:image/jpeg;base64,'+base64,
    text:'[AI 생성 모의 이미지 · 정량 측정용 아님]\n'+data.visual.caption+'\n관찰 조건과 제공 정보: '+data.visual.observations
  };
}

function showReferenceImage(file){
  const dialog=document.createElement('dialog');
  dialog.style.cssText='width:min(850px,94vw);max-height:90vh;overflow:auto';
  const close=document.createElement('button');
  close.textContent='닫기';
  close.onclick=()=>dialog.close();
  const image=document.createElement('img');
  image.src=file.image;
  image.alt=file.text||file.name;
  image.style.width='100%';
  const caption=document.createElement('p');
  caption.textContent=file.text||file.name;
  dialog.append(close,image,caption);
  dialog.addEventListener('close',()=>dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}
