// Original procedural substitutes for missing GLB props; no external downloads.
import * as THREE from "three";
import type {Kit} from "./build";

export const KENNEY_NAMES = ["tree_oak","tree_default","tree_detailed","tree_fat","tree_cone","tree-high-round","tree","plant_bushLarge","plant_bushDetailed","plant_bush","hedge","flower_redA","flower_yellowA","flower_purpleA","grass_large","grass","lily_large","lantern","cart","stall-red","stall-green","stall-bench","banner-red","banner-green","windmill","canoe"] as const;
const wood = "#9a643c", dark = "#553d30", green = "#688a43", leaf = "#8aa54e";
function mesh(g: THREE.Group, geom: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rx=0, ry=0, rz=0) {
  const m = new THREE.Mesh(geom,new THREE.MeshLambertMaterial({color}));
  m.position.set(x,y,z); m.rotation.set(rx,ry,rz); g.add(m); return m;
}
const box=(g:THREE.Group,c:string,x:number,y:number,z:number,w:number,h:number,d:number)=>mesh(g,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(g:THREE.Group,c:string,x:number,y:number,z:number,r:number,h:number)=>mesh(g,new THREE.CylinderGeometry(r,r,h,10),c,x,y,z);
const ball=(g:THREE.Group,c:string,x:number,y:number,z:number,r:number)=>mesh(g,new THREE.IcosahedronGeometry(r,1),c,x,y,z);
function make(name:string):THREE.Group {
  const g=new THREE.Group(); g.name=name;
  if(name.startsWith("tree")) {
    cyl(g,dark,0,.5,0,.12,1);
    if(name.includes("cone")) mesh(g,new THREE.ConeGeometry(.65,1.6,10),green,0,1.25,0);
    else {ball(g,green,0,1.25,0,.7);ball(g,leaf,-.35,1.1,.08,.4);ball(g,leaf,.35,1.35,-.1,.42);}
  } else if(name.startsWith("plant_")||name==="hedge") {
    for(let i=0;i<3;i++)ball(g,i%2?leaf:green,(i-1)*.27,.3,0,.35);
  } else if(name.startsWith("flower")) {
    cyl(g,green,0,.23,0,.025,.46);
    ball(g,name.includes("red")?"#d34d55":name.includes("purple")?"#9373b3":"#e9bb51",0,.48,0,.13);
  } else if(name.startsWith("grass")) {
    for(let i=0;i<5;i++)mesh(g,new THREE.ConeGeometry(.05,.45,4),green,(i-2)*.075,.22,0,0,0,(i-2)*.15);
  } else if(name==="lily_large") {
    cyl(g,green,0,.035,0,.38,.07);ball(g,"#e9a4bd",.08,.12,0,.1);
  } else if(name==="lantern") {
    cyl(g,dark,0,.52,0,.055,1.04);box(g,dark,0,1.02,0,.3,.08,.3);box(g,"#e4b963",0,1.2,0,.2,.32,.2);
    mesh(g,new THREE.ConeGeometry(.22,.24,4),dark,0,1.49,0,0,Math.PI/4);
  } else if(name==="cart") {
    box(g,wood,0,.47,0,1.3,.14,.75);box(g,wood,0,.65,-.34,1.3,.3,.08);box(g,wood,0,.65,.34,1.3,.3,.08);
    for(const z of [-.45,.45]) mesh(g,new THREE.CylinderGeometry(.3,.3,.1,14),dark,0,.3,z,Math.PI/2);
    box(g,wood,.95,.43,0,.8,.08,.08);
  } else if(name.startsWith("stall")) {
    const fabric=name.includes("green")?"#668a58":"#bb6550";
    box(g,wood,0,.65,0,1.3,.14,.8);
    for(const x of [-.6,.6])for(const z of [-.32,.32])box(g,dark,x,.85,z,.08,1.7,.08);
    if(!name.includes("bench")) {box(g,fabric,0,1.73,0,1.5,.12,.95);box(g,"#edd7ac",0,1.58,.49,1.5,.18,.06);}
  } else if(name.startsWith("banner")) {
    cyl(g,dark,0,.7,0,.035,1.4);box(g,name.includes("red")?"#b4554d":"#66904e",.3,1.1,0,.62,.4,.025);
  } else if(name==="windmill") {
    mesh(g,new THREE.CylinderGeometry(.38,.56,1.7,8),"#d9bb88",0,.85,0);
    mesh(g,new THREE.ConeGeometry(.48,.55,8),"#a05d4a",0,1.96,0);
    for(let i=0;i<4;i++)mesh(g,new THREE.BoxGeometry(.13,1.1,.08),wood,Math.sin(i*Math.PI/2)*.55,1.45+Math.cos(i*Math.PI/2)*.55,.46,0,0,-i*Math.PI/2);
  } else if(name==="canoe") {
    const hull=ball(g,wood,0,.22,0,1);hull.scale.set(.45,.23,1.5);
    box(g,dark,0,.35,0,.75,.08,.22);box(g,wood,0,.35,.65,.65,.06,.2);
  } else throw new Error("Unknown bridge prop: "+name);
  g.updateMatrixWorld(true); return g;
}
let cached:Kit|undefined;
export const fallbackKit=():Kit=>cached??=Object.fromEntries(KENNEY_NAMES.map(name=>[name,make(name)]));
