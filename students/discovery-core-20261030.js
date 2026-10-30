/* Shared SI helpers for deterministic, local teaching models. */
(function(root){'use strict';
const pi=Math.PI,rad=x=>x*pi/180;
function number(v,name,min=-Infinity,max=Infinity){if(!Number.isFinite(v)||v<min||v>max)throw RangeError(name+' must be between '+min+' and '+max+'.');return v;}
function choice(v,values,name){if(!values.includes(v))throw RangeError('Choose a valid '+name+'.');return v;}
function integer(v,name,min,max){number(v,name,min,max);if(!Number.isInteger(v))throw RangeError(name+' must be an integer.');return v;}
const samples=(n,f)=>Array.from({length:n},(_,i)=>f(i/(n-1),i));
const metric=(label,value,unit='')=>[label,value,unit];
const table=(title,headers,rows)=>({title,rows:[headers,...rows]});
const shortLabels={inertia:'Second moment',voltage:'Voltage',current:'Current',power:'Reactive power',speed:'Speed',torque:'Torque',humidity:'Humidity ratio',process:'Humidity ratio',superposition:'Displacement',doppler:'Signal',circle:'Shear stress',waveform:'Voltage',spectrum:'RMS amplitude',conversion:'Output',stations:'Section area',displacement:'Displacement',distribution:'Samples',titration:'pH'};
const plot=(id,label,x,xUnit,yUnit,series,data,extra={})=>({id,label,x,xUnit,yUnit,series,data,yLabel:shortLabels[id]||label,...(id==='power'?{xLabel:'Active power'}:{}),...extra});
function output(kind,metrics,plots,tables,extra={}){const complete=[...tables];for(const view of plots)if(view.data?.length)complete.push(table(view.label+' — plotted data',[view.x+(view.xUnit?' ('+view.xUnit+')':''),...view.series.map(([,label])=>label+(view.yUnit?' ('+view.yUnit+')':''))],view.data.map(row=>[row[view.x],...view.series.map(([key])=>row[key])])));return {kind,metrics,plots,tables:complete,data:plots[0]?.data||[],...extra};}
root.MT_DISCOVERY={pi,rad,number,choice,integer,samples,metric,table,plot,output};
})(typeof window!=='undefined'?window:globalThis);
