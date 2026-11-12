// Lógica do jogo (usada no servidor Node e no navegador no modo offline)
(function(g){
var H=40,WIN=25,RT=12,W=[];
function box(x,z,w,d,h){W.push({x:x,z:z,w:w,d:d,h:h||3,x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2})}
box(0,-H,2*H,1,5);box(0,H,2*H,1,5);box(-H,0,1,2*H,5);box(H,0,1,2*H,5);
[[0,0,8,2],[-15,10,2,8],[15,-10,2,8],[-15,-15,6,3],[15,15,6,3],[0,20,6,2],[0,-20,6,2],[-25,0,3,3],[25,0,3,3]].forEach(function(a){box(a[0],a[1],a[2],a[3])});
function rayBox(o,d,b){var t0=0,t1=1e9,A=[[o[0],d[0],b.x1,b.x2],[o[1],d[1],b.y1,b.y2],[o[2],d[2],b.z1,b.z2]];
 for(var i=0;i<3;i++){var oo=A[i][0],dd=A[i][1],a=A[i][2],c=A[i][3];
  if(Math.abs(dd)<1e-9){if(oo<a||oo>c)return null}
  else{var u=(a-oo)/dd,v=(c-oo)/dd;if(u>v){var x=u;u=v;v=x}if(u>t0)t0=u;if(v<t1)t1=v;if(t0>t1)return null}}
 return t0}
function rayWalls(o,d,max){var m=max;for(var i=0;i<W.length;i++){var w=W[i],t=rayBox(o,d,{x1:w.x1,x2:w.x2,y1:0,y2:w.h,z1:w.z1,z2:w.z2});if(t!==null&&t<m)m=t}return m}
function push(p,r){for(var i=0;i<W.length;i++){var w=W[i],cx=Math.max(w.x1,Math.min(p.x,w.x2)),cz=Math.max(w.z1,Math.min(p.z,w.z2)),dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);if(d<r){if(d>1e-4){p.x+=dx/d*(r-d);p.z+=dz/d*(r-d)}else p.x+=r}}}
function parts(e){var x=e.x,z=e.z;return[
 {x1:x-.22,x2:x+.22,y1:1.43,y2:1.87,z1:z-.22,z2:z+.22,head:1},
 {x1:x-.4,x2:x+.4,y1:.6,y2:1.4,z1:z-.25,z2:z+.25},
 {x1:x-.62,x2:x-.42,y1:.6,y2:1.4,z1:z-.125,z2:z+.125},
 {x1:x+.42,x2:x+.62,y1:.6,y2:1.4,z1:z-.125,z2:z+.125},
 {x1:x-.35,x2:x-.05,y1:0,y2:.6,z1:z-.15,z2:z+.15},
 {x1:x+.05,x2:x+.35,y1:0,y2:.6,z1:z-.15,z2:z+.15}]}
function norm(d){var L=Math.hypot(d[0],d[1],d[2])||1;return[d[0]/L,d[1]/L,d[2]/L]}
function Game(){this.ents=[];for(var k=0;k<12;k++){var team=k<6?'b':'r',i=k%6;this.ents.push({id:k,team:team,i:i,human:false,name:'Bot',x:0,z:0,yaw:0,hp:100,alive:true,rt:0,cd:0,st:1,stt:0});this.spawn(this.ents[k])}
 this.score={b:0,r:0};this.over=null;this.ot=0;this.ev=[]}
Game.prototype={
 spawn:function(e){e.hp=100;e.alive=true;e.rt=0;e.x=(e.i-2.5)*5;e.z=e.team=='b'?H-4:-(H-4);e.yaw=e.team=='b'?0:Math.PI},
 reset:function(){this.score={b:0,r:0};this.over=null;for(var i=0;i<12;i++)this.spawn(this.ents[i])},
 join:function(team,name){var self=this,hb=0,hr=0;this.ents.forEach(function(e){if(e.human){e.team=='b'?hb++:hr++}});
  var order=(team=='b'||team=='r')?[team]:(hb<=hr?['b','r']:['r','b']);
  for(var n=0;n<order.length;n++){var e=this.ents.filter(function(e){return e.team==order[n]&&!e.human})[0];if(e){e.human=true;e.name=name;this.spawn(e);return e.id}}
  return -1},
 leave:function(id){var e=this.ents[id];if(e){e.human=false;e.name='Bot'}},
 setPos:function(id,x,z,yaw){var e=this.ents[id];if(!e||!e.human||!e.alive||!isFinite(x)||!isFinite(z))return;e.x=Math.max(-H+1,Math.min(H-1,x));e.z=Math.max(-H+1,Math.min(H-1,z));e.yaw=+yaw||0},
 shoot:function(id,o,d){var e=this.ents[id];if(!e||!e.human||!e.alive||e.cd>0||this.over)return;
  if(!o||!d||o.length!=3||d.length!=3||!o.every(isFinite)||!d.every(isFinite))return;e.cd=.14;this.fire(e,o,norm(d),34)},
 fire:function(s,o,d,dmg){var best=rayWalls(o,d,150),hit=null;
  for(var i=0;i<12;i++){var t=this.ents[i];if(t===s||!t.alive)continue;var p=parts(t);for(var j=0;j<p.length;j++){var u=rayBox(o,d,p[j]);if(u!==null&&u<best){best=u;hit=[t,p[j].head]}}}
  this.ev.push({t:'tr',o:o,e:[o[0]+d[0]*best,o[1]+d[1]*best,o[2]+d[2]*best],team:s.team});
  if(hit&&hit[0].team!=s.team){var t=hit[0],hs=!!hit[1];t.hp=hs?0:t.hp-dmg;if(t.hp<=0)this.kill(s,t,hs)}},
 kill:function(s,t,hs){t.alive=false;t.hp=0;t.rt=RT;this.score[s.team]++;this.ev.push({t:'k',k:s.id,v:t.id,hs:hs});if(this.score[s.team]>=WIN&&!this.over){this.over=s.team;this.ot=8}},
 step:function(dt){if(this.over){this.ot-=dt;if(this.ot<=0)this.reset()}
  for(var n=0;n<12;n++){var e=this.ents[n];e.cd-=dt;
   if(!e.alive){if(!this.over&&(e.rt-=dt)<=0)this.spawn(e);continue}
   if(e.human||this.over)continue;
   var best=null,bd=1e9;for(var m=0;m<12;m++){var o=this.ents[m];if(o.team!=e.team&&o.alive){var dd=Math.hypot(o.x-e.x,o.z-e.z);if(dd<bd){bd=dd;best=o}}}
   if(!best)continue;
   var dx=best.x-e.x,dz=best.z-e.z,L=Math.hypot(dx,dz)||1;e.stt-=dt;if(e.stt<=0){e.st=Math.random()<.5?-1:1;e.stt=1+Math.random()*1.5}
   var fw=bd>14?1:bd<8?-1:0;e.x+=(dx/L*fw+(-dz/L)*e.st*.6)*4*dt;e.z+=(dz/L*fw+(dx/L)*e.st*.6)*4*dt;push(e,.5);e.yaw=Math.atan2(-dx,-dz);
   var a=[e.x,1.5,e.z],d=[best.x-a[0],1.0-a[1],best.z-a[2]],Ld=Math.hypot(d[0],d[1],d[2]);d=norm(d);
   if(e.cd<=0&&Ld<50&&rayWalls(a,d,Ld)>=Ld){e.cd=.45+Math.random()*.4;d[0]+=(Math.random()-.5)*.09;d[1]+=(Math.random()-.5)*.06;d[2]+=(Math.random()-.5)*.09;this.fire(e,a,norm(d),12)}}},
 snapshot:function(){var r=function(v){return Math.round(v*100)/100};
  return{t:'s',e:this.ents.map(function(e){return[r(e.x),r(e.z),r(e.yaw),Math.max(0,e.hp|0),e.alive?1:0,Math.ceil(Math.max(0,e.rt)),e.human?1:0]}),
   n:this.ents.map(function(e){return e.human?e.name:''}),s:[this.score.b,this.score.r],o:this.over,ev:this.ev}}
};
var api={Game:Game,W:W,H:H,WIN:WIN,rayWalls:rayWalls,push:push};
if(typeof module!=='undefined')module.exports=api;else g.ARENA=api;
})(this);
