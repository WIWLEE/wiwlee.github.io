(function(root){
'use strict';
const roles={
  '소자':'개발 단계의 메모리 셀과 주변 트랜지스터의 전기적 특성·신뢰성 검증. 문턱전압, 누설전류, 동작 전류, 데이터 유지 특성 가운데 1~2개만 골라 개발 샘플의 구조·공정 조건별 차이를 비교한다. 각 용어의 뜻과 단위·기준을 지문에 설명하고, 온도·측정 조건의 영향을 분리하는 재시험과 다음 개발 단계 진입 기준을 제안하게 한다.',
  '기반기술':'개발 단계의 계측·결함 검사·물성 분석·소재·마스크 기술 검증. 매 문제에서 한 분야만 골라 막 두께, 패턴 폭, 입자·결함 개수, 측정 반복성 가운데 1~2개를 비교한다. 새로운 소재나 측정 방법의 유효성을 검증하며, 실제 샘플 차이와 측정 장비·방법의 편차를 분리하는 시험과 적용 기준을 제안하게 한다. 전문 분석 장비 지식 없이 표와 지문만으로 판단할 수 있도록 원리를 쉽게 설명한다.',
  '설계':'첫 실리콘의 타이밍·전력·PVT 실측을 시뮬레이션과 비교하고 설계 마진을 검증',
  'PE':'개발 DRAM 샘플의 전압·온도·타이밍 특성, 불량 재현, 시험 조건 및 규격 여유 검증',
  '양기':'전공정 개발 웨이퍼의 분할 실험으로 공정 조건별 전기 특성과 재현성 검증',
  '양기P&T':'후공정 개발 샘플의 시험 장비·소켓·사이트 간 상관성, 반복 측정과 시험 조건 검증',
  '패키지개발':'HBM·첨단 패키지 시제품의 접합·휨·열·전기 특성과 가속 신뢰성 시험'
};
const schema={type:'object',additionalProperties:false,required:['title','scenario','datasets','constraints','modelAnswer','visual'],properties:{visual:{type:'object',additionalProperties:false,required:['caption','prompt','observations'],properties:{caption:{type:'string'},prompt:{type:'string'},observations:{type:'string'}}},modelAnswer:{type:'string'},title:{type:'string'},scenario:{type:'string'},datasets:{type:'array',minItems:2,maxItems:2,items:{type:'object',additionalProperties:false,required:['description','columns','rows'],properties:{description:{type:'string'},columns:{type:'array',minItems:4,maxItems:10,items:{type:'string'}},rows:{type:'array',minItems:12,maxItems:30,items:{type:'array',minItems:4,maxItems:10,items:{type:'string'}}}}}},constraints:{type:'string'}}};
function prompt(role){if(!roles[role])throw Error('직무를 선택하세요.');return '반도체 채용 PT 모의 문제 1개를 새로 만들어라. [필수 언어] 문제 제목, 지문, 모든 질문·과제, 참고자료 설명과 열 이름, 제약조건 문서, 모범답안은 자연스러운 한국어로 작성하라. 영어 문장이나 영문 문단은 금지한다. 파일명, 샘플 ID, 수치·단위, DRAM·HBM 같은 표준 기술 약어는 원래 표기를 허용한다. [필수 단계] 모든 직무에서 개발 샘플·시제품·시험용 웨이퍼의 시험 및 특성 검증만 다룬다. 양기와 양기P&T는 개발팀과 협업해 시험 조건을 검증하는 역할로 설정한다. 양산 라인 수율 개선, 생산량·UPH, 출하·납기, 양산 장비 가동 최적화는 출제하지 마라. 개발 시험 결과에서 이상을 발견한 상황으로 시작해, 기준 대비 편차를 계산하고 경쟁 원인을 좁힌 뒤 재시험·설계/조건 수정·다음 개발 검증 단계 진입 여부를 판단하게 하라. 직무: '+role+' / '+roles[role]+'. 실제 기출이나 회사 내부 데이터가 아닌 가상 데이터임을 명시하라. 준비 30분, 발표 15분. 실무 경험이 없는 신입사원이 지문과 표만 보고 30분 안에 풀 수 있게 작성하라. 한 문장에 한 가지 정보만 담고, 꼭 필요한 직무 용어와 약어는 처음 등장할 때 쉬운 말로 뜻을 설명하라. 계산은 개수, 차이, 평균, 비율·불량률 정도로 제한하고 식과 단위, 계산에 필요한 분모를 제공하라. 고급 통계, 전문 장비 지식, 외부 규격 검색을 요구하지 마라. 조건은 2~3개, 핵심 지표는 1~2개로 제한하고 비교군과 변경 조건을 눈에 띄게 표시하라. 단순 지식 문답은 금지. 현상→경쟁 원인 가설→추가 통제 실험→시험 마진·재현성·샘플/장비 제약 간 대안 선택을 요구. 교란요인 1개와 미확인 정보 1개를 포함. 문제와 참고파일에는 정답을 노출하지 마라. modelAnswer에만 계산식·수치·단위, 경쟁 가설, 통제 실험, 의사결정 및 승인 기준을 담은 구체적인 한국어 모범답안을 작성하라. 측정표와 수치를 대조하고 가정과 관측을 구분하라.\n title: 구체적 문제 제목 150자 이내. scenario: 상황, 역할, 분석 과제 4개, 제출물, 가상 고지를 담은 700~1100자 지문. datasets[0]는 measurements.csv, datasets[1]는 process_history.csv로 저장된다. 각 12행, 4~6열. 첫 파일은 분자/분모 또는 단위 있는 측정 원자료, 둘째는 같은 ID/그룹으로 연결되는 조건·변경 이력·비교군. 물리적으로 합리적인 수치. 행은 열과 같은 개수의 문자열. 중복 측정/독립 표본 구분. 불량 수<=검사 수. 합계, 단위, ID, 조건을 스스로 검산. constraints는 constraints.csv에 들어간다. 규격, 단위, 용어 뜻, 합격 기준, 재시험 제약을 5~8개의 짧은 줄로 작성하라. 각 줄 형식은 항목 | 내용이다. 머리말, 마크다운 문법, 빈 줄을 넣지 마라. 지문에서 실제 CSV 파일 이름 3개를 인용하라. visual에는 이 문제의 개발 시험과 연결되는 공정 단면 또는 소자 구조 관찰 이미지의 제작 묘사를 작성하라. caption은 쉬운 한국어 제목, prompt는 형상과 비교할 부분을 상세히 지정한 한국어 이미지 묘사, observations는 관찰 조건과 문제에서 제공할 정성적 관측 사실이다. visual_reference.jpg가 함께 생성될 수 있다. 그림은 교육용 합성 참고 이미지이며 실제 현미경 측정 사진이 아니라고 명시하라. 수치, 정확한 치수, 합격 판정은 CSV와 본문만으로 판단할 수 있게 하라. 정답이나 원인 확정은 그림이나 캡션에 쓰지 마라.'}
function cell(value){let s=String(value);if(/^\s*[=+@-]/.test(s)&&!/^\s*-?\d+(\.\d+)?\s*$/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
function csv(t){return [t.columns,...t.rows].map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n'}
function validate(d, requireKorean=true){if(!d?.visual||![d.visual.caption,d.visual.prompt,d.visual.observations].every(value=>typeof value==='string'&&value.trim()&&value.length<6000))throw Error('이미지 자료 설명 형식 오류입니다.');if(!d||typeof d.modelAnswer!=='string'||!d.modelAnswer.trim()||typeof d.title!=='string'||!d.title.trim()||d.title.length>180||typeof d.scenario!=='string'||d.scenario.length<200||d.scenario.length>12000||typeof d.constraints!=='string'||d.constraints.length<100||d.constraints.length>16000||!Array.isArray(d.datasets)||d.datasets.length!==2)throw Error('문제 형식 오류입니다. 다시 생성하세요.');let total=0;for(const t of d.datasets){if(typeof t.description!=='string'||!Array.isArray(t.columns)||t.columns.length<4||t.columns.length>10||!t.columns.every(v=>typeof v==='string'&&v.length>0&&v.length<160)||new Set(t.columns).size!==t.columns.length||!Array.isArray(t.rows)||t.rows.length<12||t.rows.length>30)throw Error('데이터 표 구성 오류입니다.');for(const row of t.rows){if(!Array.isArray(row)||row.length!==t.columns.length||!row.every(v=>typeof v==='string'&&v.length<500))throw Error('CSV 열 수가 일치하지 않습니다.');total+=row.join('').length}}if(total>80000)throw Error('데이터가 너무 큽니다.');if(requireKorean&&!isKorean(d))throw Error('한국어 교정을 마치지 못했습니다. 모델을 바꾸거나 다시 생성하세요.');return d}
function isKorean(data){
  const prose=[data.visual.caption,data.visual.prompt,data.visual.observations,data.title,data.scenario,data.constraints,data.modelAnswer,...data.datasets.map(t=>t.description)];
  const labels=data.datasets.flatMap(t=>[...t.columns,...t.rows.flat()]);
  const han=/\p{Script=Han}/u;
  const englishSentence=/(?:\b[a-zA-Z]{2,}[ \t]+){5}[a-zA-Z]{2,}/;
  return prose.every(value=>/[가-힣]/.test(value)&&!han.test(value)&&!englishSentence.test(value))
    &&labels.every(value=>!han.test(value)&&!englishSentence.test(value));
}
function files(d){
  validate(d);
  const rows=d.constraints.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const separator=line.indexOf('|');
    return separator<0?['시험 조건',line]:[line.slice(0,separator).trim(),line.slice(separator+1).trim()];
  });
  rows.push(['측정 데이터',d.datasets[0].description],['조건·변경 이력',d.datasets[1].description]);
  return [
    {name:'measurements.csv',text:csv(d.datasets[0])},
    {name:'process_history.csv',text:csv(d.datasets[1])},
    {name:'constraints.csv',text:csv({columns:['항목','내용'],rows})}
  ];
}
function extract(d, requireKorean=true){if(d.status==='incomplete')throw Error('응답 길이 제한으로 미완성입니다. 다시 생성하세요.');if(d.status==='failed'||d.error)throw Error('문제 생성에 실패했습니다.');const parts=(d.output||[]).flatMap(i=>i.content||[]);if(parts.some(p=>p.type==='refusal'))throw Error('AI가 생성을 거절했습니다.');const text=parts.filter(p=>p.type==='output_text').map(p=>p.text).join('');if(!text)throw Error('문제 응답이 없습니다.');try{return validate(JSON.parse(text),requireKorean)}catch(e){if(e instanceof SyntaxError)throw Error('JSON 형식 오류입니다. 다시 생성하세요.');throw e}}
const api={roles,schema,prompt,csv,validate,isKorean,files,extract};if(typeof module==='object'&&module.exports)module.exports=api;else root.PTGenerator=api;
})(typeof window==='object'?window:globalThis);