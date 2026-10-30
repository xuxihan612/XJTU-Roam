// Interface example, NOT playable map data. No campus geometry is included.
window.CAMPUS = {
  source: 'Fill in your map attribution and license',
  W: null, H: null, scale: 2,
  wall: {x0:null, y0:null, x1:null, y1:null},
  buildings: [], roads: [], streets: [], pitches: [], parks: [],
  water: [], woods: [], gates: [], plaza: [],
  pois: {tengfei: {x:null,y:null}},
  nameNotes: {}
};
// Polygon feature: {n:'your name', s:'modern', lv:3, p:[[x,y], ...]}
// Road: {n:'your name', k:'unclassified', w:12, p:[[x,y], ...]}
// Gate: {n:'your name', x:..., y:..., side:'n' or 's' or 'e' or 'w'}
