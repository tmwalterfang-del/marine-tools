/* Chapter navigation is source coverage, not a blanket claim of numerical proof. */
(function(){'use strict';const S=window.MT_STUDY;
const chapters=[
[1,'Mathematics',7,22],[2,'Physics',23,29],[3,'Mechanics',30,48],[4,'Machine elements',49,54],[5,'Chemistry',55,78],[6,'Electrical engineering',79,98],[7,'Electronics and telecommunications',99,121],[8,'Power electronics',122,133],[9,'Engine theory',134,148],[10,'Steam theory',149,154],[11,'Heat and flow',155,176],[12,'Refrigeration',177,180],[13,'Navigation',181,194],[14,'Cargo and ship stability',195,218],[15,'Economics',219,221],[16,'Corrected displacement',222,224]];
S.chapters=chapters.map(([number,title,first,last])=>{const rows=S.sourceEquationRegister.filter(r=>r.page>=first&&r.page<=last);return {number,title,first,last,expressions:rows.length,formulaIds:[...new Set(rows.map(r=>r.formulaId))],status:'Source pages read and relationships registered. Expression-level tests and empirical-data exceptions are separate.'}});
S.chapterLabel='All 16 formula chapters (printed pages 7–224) have been read and registered with explicit conditions.';
S.reviewLabel='Source reading and metadata completeness do not prove every expression or empirical coefficient. Check each relationship’s numerical status. Reference tables and charts are not reproduced.';
})();
