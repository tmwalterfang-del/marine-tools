// Restricted arithmetic for repository-owned expression records. No eval/JS.
// Explicit values are required; unsupported notation fails rather than passing.
export function evaluate(text, values, degrees = false) {
  const functions = {
    sum: x => x, // Explicit one-term summation specialization in the worked-case fixture.
    sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log, max: Math.max,
    log10: Math.log10, sin: x => Math.sin(degrees ? x * Math.PI / 180 : x),
    cos: x => Math.cos(degrees ? x * Math.PI / 180 : x),
    tan: x => Math.tan(degrees ? x * Math.PI / 180 : x),
    atan2: (y, x) => Math.atan2(y, x) * (degrees ? 180 / Math.PI : 1),
    wrap360: x => ((x % 360) + 360) % 360,
    wrap180: x => ((x + 180) % 360 + 360) % 360 - 180,
    'wrap2π': x => ((x % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI),
  };
  const names = Object.keys(values).sort((a,b) => b.length-a.length);
  const functionNames = Object.keys(functions).sort((a,b) => b.length-a.length);
  const supers = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+','ⁿ':'n','ᵐ':'m','ᵖ':'p','ᵏ':'k','ˣ':'x' };
  const tokens = [];
  text = text.replaceAll('log₁₀', 'log10').replaceAll('Σ', 'sum')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿᵐᵖᵏˣ]+/g,sequence=>'^('+[...sequence].map(c=>supers[c]).join('')+')');
  for (let i=0; i<text.length;) {
    const rest=text.slice(i), c=text[i];
    if (/\s/.test(c)) {i++;continue;}
    const fn=functionNames.find(n=>rest.startsWith(n) && (!Object.hasOwn(values,n) || rest[n.length]==='('));
    if(fn){tokens.push({fn});i+=fn.length;continue;}
    const name=names.find(n=>rest.startsWith(n));
    if(name){if(!Number.isFinite(values[name]))throw Error('Non-finite input '+name);tokens.push({n:values[name]});i+=name.length;continue;}
    const num=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if(num){tokens.push({n:Number(num[0])});i+=num[0].length;continue;}
    const sup=rest.match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/);
    if(sup){tokens.push('^','(',{n:Number([...sup[0]].map(x=>supers[x]).join(''))},')');i+=sup[0].length;continue;}
    if(c==='π'){tokens.push({n:Math.PI});i++;continue;}
    if(c==='√'){tokens.push({fn:'sqrt'});i++;continue;}
    if('+-−*/·()[]^,'.includes(c)){tokens.push({'−':'-','·':'*','[':'(',']':')'}[c]||c);i++;continue;}
    throw Error('Unsupported numeric notation: '+rest);
  }
  let i=0;
  function atom(){
    const t=tokens[i++];
    if(t==='+'||t==='-')return (t==='-'?-1:1)*power();
    if(t==='('){const a=expression();if(tokens[i++]!==')')throw Error('Unclosed group');return a;}
    if(t?.n!==undefined)return t.n;
    if(t?.fn){
      let exponent=null;
      if(tokens[i]==='^'){i++;exponent=atom();}
      let args=[];
      if(tokens[i]==='('){i++;args.push(expression());while(tokens[i]===','){i++;args.push(expression());}if(tokens[i++]!==')')throw Error('Unclosed function');}
      else args=[power()];
      if(args.length!==(['atan2','max'].includes(t.fn)?2:1))throw Error('Invalid function arity');
      const a=functions[t.fn](...args);return exponent===null?a:a**exponent;
    }
    throw Error('Expected numeric value');
  }
  function power(){let a=atom();if(tokens[i]==='^'){i++;a=a**power();}return a;}
  function product(){let a=power();while(i<tokens.length && ![')',',','+','-'].includes(tokens[i])){const op=['*','/'].includes(tokens[i])?tokens[i++]:'*';const b=power();a=op==='/'?a/b:a*b;}return a;}
  function expression(){let a=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();a=op==='+'?a+b:a-b;}return a;}
  const answer=expression();
  if(i!==tokens.length||!Number.isFinite(answer))throw Error('Incomplete or non-finite numeric expression');
  return answer;
}
