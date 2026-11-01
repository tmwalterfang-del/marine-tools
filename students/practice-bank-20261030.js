/* Original chapter exercises. Authored answers retain independent reference
   checks; no arbitrary expression evaluator is shipped to the student UI. */
(function(){'use strict';
const questions=[],levels=['Foundation','Applied','Intermediate','Advanced'];
const categories={1:'Mathematics',2:'Physics & Waves',3:'Mechanics',4:'Machine Elements',5:'Chemistry',6:'Electrical Engineering',7:'Electronics & Telecommunications',8:'Power Electronics',9:'Engine Processes',10:'Steam Engineering',11:'Thermodynamics',12:'Refrigeration & Heat Pumps',13:'Navigation',14:'Ship Stability',15:'Engineering Economics',16:'Cargo & Survey'};
function q(chapter,rank,topic,prompt,expected,unit,hint,working,references,options={}){
 if(!Number.isInteger(chapter)||chapter<1||chapter>16||!Number.isInteger(rank)||rank<1||rank>16||!Number.isFinite(expected)||!Array.isArray(working)||!working.length||!references)throw Error('Incomplete authored exercise '+chapter+'/'+rank);
 questions.push({id:'practice-c'+String(chapter).padStart(2,'0')+'-q'+String(rank).padStart(2,'0'),chapter,difficulty:rank,level:levels[Math.floor((rank-1)/4)],category:options.category||categories[chapter],topic,prompt,expected,unit,hint,steps:[...working,'Answer: '+window.MT_STUDENT_FORMAT(expected)+(unit?' '+unit:'')],tolerance:options.exact?0:Math.max(1e-15,Math.abs(expected)*.0005),relativeTolerance:options.exact?0:.001,references:Array.isArray(references)?references:[references]});
}
const source=(id,values,options={})=>({kind:'source',id,values,side:1,segment:0,expected:'$answer',...options});
const primary=(id,values,options={})=>({kind:'primary',id,values,side:1,segment:0,expected:'$answer',...options});
const calc=(id,inputs,options={})=>({kind:'calculator',id,inputs,expected:'$answer',...options});
const finite=(operation,values,options={})=>({kind:'finite',operation,values,expected:'$answer',...options});
const model=(id,inputs,output,options={})=>({kind:'model',id,inputs,output,expected:'$answer',...options});
window.MT_PRACTICE_BANK={questions,q,source,primary,calc,finite,model,answer:'$answer',scaled:answerScale=>({answerScale}),levels,categories};
})();
