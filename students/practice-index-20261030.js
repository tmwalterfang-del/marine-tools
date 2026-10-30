(function(){'use strict';
const B=window.MT_PRACTICE_BANK,original=window.MT_PRACTICE;
const legacy={
 'geo-1':[1,4],'therm-1':[2,8],'mech-1':[3,4],'shaft':[4,10],
 'chem-molar':[5,4],'chem-ph':[5,8],
 'elec-1':[6,2],'elec-2':[6,4],'res-1':[6,3],'res-2':[6,8],'motor-1':[6,12],'energy-1':[6,8],
 'elect-dB':[7,6],'instr-12ma':[7,8],'instr-4ma':[7,10],'instr-P':[7,12],
 'elec-buck':[8,6], 'fuel-1':[9,4],'eng-1':[9,8],'engine-otto':[9,10],'engine-fuel-power':[9,8],
 'steam-enthalpy':[10,6],'steam-turbine':[10,8],'pump-1':[11,8],'pumps-npsha':[11,12],
 'refrigeration':[12,8],'passage-1':[13,4],
 'disp-1':[14,2],'gm-1':[14,6],'tpc-1':[14,4],'trim-1':[14,10],'fuel-2':[14,8],
 'econ-real':[15,4],'econ-pv':[15,8], 'dwt-1':[16,6],'draft-1':[16,8]
};
if(original.length!==36||B.questions.length!==256)throw Error('Incomplete chapter practice bank');
for(const e of original){const meta=legacy[e.id];if(!meta)throw Error('Missing original exercise chapter: '+e.id);e.chapter=meta[0];e.difficulty=meta[1]-.25;e.level=B.levels[Math.floor((meta[1]-1)/4)];}
for(let chapter=1;chapter<=16;chapter++){const rows=B.questions.filter(e=>e.chapter===chapter);if(rows.length!==16||new Set(rows.map(e=>e.difficulty)).size!==16)throw Error('Incomplete chapter '+chapter);}
const combined=[...original,...B.questions];if(new Set(combined.map(e=>e.id)).size!==combined.length)throw Error('Repeated exercise identifier');
window.MT_PRACTICE=combined;
})();
