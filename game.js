// Lógica do jogo (usada no servidor Node e no navegador)
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
 {x1:x-.15,x2:x+.15,y1:1.5,y2:1.8,z1:z-.15,z2:z+.15,head:1},
 {x1:x-.4,x2:x+.4,y1:.6,y2:1.4,z1:z-.25,z2:z+.25},
 {x1:x-.62,x2:x-.42,y1:.6,y2:1.4,z1:z-.125,z2:z+.125},
 {x1:x+.42,x2:x+.62,y1:.6,y2:1.4,z1:z-.125,z2:z+.125},
 {x1:x-.35,x2:x-.05,y1:0,y2:.6,z1:z-.15,z2:z+.15},
 {x1:x+.05,x2:x+.35,y1:0,y2:.6,z1:z-.15,z2:z+.15}]}
var WEAPONS={knife:{n:'Faca',dmg:50,cd:.5,pel:1,spr:0,rng:2.4,pr:0,ideal:2,cls:'m',melee:1},pistol:{n:'Pistola',dmg:34,cd:.28,pel:1,spr:0,rng:40,pr:0,ideal:12,cls:'p'},revolver:{n:'Revólver',dmg:55,cd:.6,pel:1,spr:0,rng:45,pr:250,ideal:13,cls:'p'},smg:{n:'Submetralhadora',dmg:14,cd:.08,pel:1,spr:.03,rng:25,pr:300,ideal:9,cls:'b'},rifle:{n:'Fuzil',dmg:27,cd:.12,pel:1,spr:.012,rng:50,pr:500,ideal:14,cls:'b'},shotgun:{n:'Escopeta',dmg:13,cd:.85,pel:8,spr:.07,rng:14,pr:400,ideal:6,cls:'b'},lmg:{n:'Metralhadora',dmg:20,cd:.07,pel:1,spr:.05,rng:40,pr:700,ideal:15,cls:'b'},sniper:{n:'Sniper',dmg:100,cd:1.3,pel:1,spr:0,rng:90,pr:800,ideal:25,cls:'b'}};
var SK=['c:green','c:yellow','c:purple','c:orange','c:pink','c:cyan','c:black','c:white','t:heart','t:skull','t:rainbow','t:star'];
function pickW(){var r=Math.random()*100;return r<22?'pistol':r<32?'revolver':r<52?'smg':r<72?'rifle':r<86?'shotgun':'lmg'}
function norm(d){var L=Math.hypot(d[0],d[1],d[2])||1;return[d[0]/L,d[1]/L,d[2]/L]}
function visible(ax,az,bx,bz){var L=Math.hypot(bx-ax,bz-az);if(L<1e-6)return true;return rayWalls([ax,.5,az],[(bx-ax)/L,0,(bz-az)/L],L)>=L}
var WP=[];W.forEach(function(w,i){if(i<4)return;[[w.x1-1,w.z1-1],[w.x2+1,w.z1-1],[w.x1-1,w.z2+1],[w.x2+1,w.z2+1]].forEach(function(p){WP.push({x:p[0],z:p[1]})})});
var N=WP.length,DD=[],NX=[];
for(var wi=0;wi<N;wi++){DD[wi]=[];for(var wj=0;wj<N;wj++)DD[wi][wj]=wi==wj?0:(visible(WP[wi].x,WP[wi].z,WP[wj].x,WP[wj].z)?Math.hypot(WP[wi].x-WP[wj].x,WP[wi].z-WP[wj].z):1e9)}
for(var wk=0;wk<N;wk++)for(var wi2=0;wi2<N;wi2++)for(var wj2=0;wj2<N;wj2++)if(DD[wi2][wk]+DD[wk][wj2]<DD[wi2][wj2])DD[wi2][wj2]=DD[wi2][wk]+DD[wk][wj2];
function route(e,g){var best=1e9,bi=-1,B=[],j,i;for(j=0;j<N;j++)B[j]=visible(WP[j].x,WP[j].z,g.x,g.z);
 for(i=0;i<N;i++){if(!visible(e.x,e.z,WP[i].x,WP[i].z))continue;var d1=Math.hypot(WP[i].x-e.x,WP[i].z-e.z);for(j=0;j<N;j++){if(!B[j]||DD[i][j]>=1e9)continue;var tot=d1+DD[i][j]+Math.hypot(WP[j].x-g.x,WP[j].z-g.z);if(tot<best){best=tot;bi=i}}}return bi}
function Game(){this.ents=[];for(var k=0;k<12;k++){var team=k<6?'b':'r',i=k%6;this.ents.push({id:k,team:team,i:i,human:false,name:'Bot',x:0,z:0,yaw:0,hp:100,alive:true,rt:0,cd:0,st:1,stt:0,w:'pistol',sk:'',thk:0,tg:-1,rx:0,aim:0,att:-1,attT:0,nt:0,nw:-1,gt:0,ls:null});this.spawn(this.ents[k])}
 this.score={b:0,r:0};this.over=null;this.ot=0;this.ev=[]}
Game.prototype={
 spawn:function(e){e.hp=100;e.alive=true;e.rt=0;if(!e.human){e.w=pickW();e.sk=Math.random()<.45?SK[Math.random()*SK.length|0]:'';e.tg=-1;e.ls=null;e.nw=-1;e.att=-1;e.attT=0;e.gt=0}e.x=(e.i-2.5)*5;e.z=e.team=='b'?H-4:-(H-4);e.yaw=e.team=='b'?0:Math.PI},
 reset:function(){this.score={b:0,r:0};this.over=null;for(var i=0;i<12;i++)this.spawn(this.ents[i])},
 join:function(team,name,skin){var self=this,hb=0,hr=0;this.ents.forEach(function(e){if(e.human){e.team=='b'?hb++:hr++}});
  var order=(team=='b'||team=='r')?[team]:(hb<=hr?['b','r']:['r','b']);
  for(var n=0;n<order.length;n++){if((order[n]=='b'?hb:hr)>=3)continue;var e=this.ents.filter(function(e){return e.team==order[n]&&!e.human})[0];if(e){e.human=true;e.name=name;this.spawn(e);e.sk=SK.indexOf(skin)>=0?skin:'';return e.id}}
  return -1},
 leave:function(id){var e=this.ents[id];if(e){e.human=false;e.name='Bot'}},
 setPos:function(id,x,z,yaw){var e=this.ents[id];if(!e||!e.human||!e.alive||!isFinite(x)||!isFinite(z))return;e.x=Math.max(-H+1,Math.min(H-1,x));e.z=Math.max(-H+1,Math.min(H-1,z));e.yaw=+yaw||0},
 shoot:function(id,o,d,wk){var e=this.ents[id];if(!e||!e.human||!e.alive||e.cd>0||this.over||this.frozen)return;
  if(!o||!d||o.length!=3||d.length!=3||!o.every(isFinite)||!d.every(isFinite))return;var w=WEAPONS[wk]||WEAPONS.pistol;e.w=WEAPONS[wk]?wk:'pistol';e.cd=w.cd*.9;this.shot(e,o,norm(d),w,1)},
 shot:function(s,o,d,w,m){for(var p=0;p<w.pel;p++){var dd=d;if(w.spr)dd=norm([d[0]+(Math.random()-.5)*w.spr*2,d[1]+(Math.random()-.5)*w.spr*2,d[2]+(Math.random()-.5)*w.spr*2]);this.ray(s,o,dd,w.dmg*m,w.pel>1||!!w.melee,p<3&&!w.melee,w.rng)}},
 ray:function(s,o,d,dmg,multi,tr,rng){var best=rayWalls(o,d,rng),hit=null;
  for(var i=0;i<12;i++){var t=this.ents[i];if(t===s||!t.alive)continue;var p=parts(t);for(var j=0;j<p.length;j++){var u=rayBox(o,d,p[j]);if(u!==null&&u<best){best=u;hit=[t,p[j].head]}}}
  if(tr)this.ev.push({t:'tr',o:o,e:[o[0]+d[0]*best,o[1]+d[1]*best,o[2]+d[2]*best],team:s.team});
  if(hit&&hit[0].team!=s.team){var t=hit[0],hs=!!hit[1],head=hs;t.att=s.id;t.attT=3;if(hs&&multi){dmg*=2.5;hs=false}var dealt=hs?t.hp:Math.min(dmg,t.hp);t.hp=hs?0:t.hp-dmg;if(s.human||t.human)this.ev.push({t:'h',k:s.id,v:t.id,d:Math.round(dealt),hs:head,p:[o[0]+d[0]*best,o[1]+d[1]*best,o[2]+d[2]*best]});if(t.hp<=0)this.kill(s,t,hs)}},
 kill:function(s,t,hs){t.alive=false;t.hp=0;t.rt=RT;this.score[s.team]++;this.ev.push({t:'k',k:s.id,v:t.id,hs:hs,w:s.w});if(this.score[s.team]>=WIN&&!this.over){this.over=s.team;this.ot=8}},
 step:function(dt){if(this.frozen)return;if(this.over){this.ot-=dt;if(this.ot<=0){if(this.onOver){this.onOver();return}this.reset()}}
  for(var n=0;n<12;n++){var e=this.ents[n];e.cd-=dt;
   if(!e.alive){if(!this.over&&(e.rt-=dt)<=0)this.spawn(e);continue}
   if(e.human||this.over)continue;
   this.ai(e,dt)}},
 ai:function(e,dt){var wp=WEAPONS[e.w]||WEAPONS.pistol,ents=this.ents,i,o;
  e.thk-=dt;e.stt-=dt;e.nt-=dt;e.attT-=dt;e.rx-=dt;e.aim=Math.max(0,e.aim-dt*.5);
  if(e.thk<=0){e.thk=.15+Math.random()*.1;var best=null,bs=1e9,eye=[e.x,1.5,e.z];
   for(i=0;i<12;i++){o=ents[i];if(o.team==e.team||!o.alive)continue;var d=Math.hypot(o.x-e.x,o.z-e.z);if(d>75)continue;
    var L=Math.hypot(o.x-e.x,.5,o.z-e.z),dv=[(o.x-e.x)/L,-.5/L,(o.z-e.z)/L];
    if(rayWalls(eye,dv,L)>=L){var sc=d-(100-o.hp)*.12-(e.att===o.id&&e.attT>0?15:0);if(sc<bs){bs=sc;best=o}}}
   if(best){if(e.tg!==best.id){e.tg=best.id;e.rx=.2+Math.random()*.25;e.aim=0}e.ls={x:best.x,z:best.z,t:6}}
   else{e.tg=-1;if(e.attT>0&&e.att>=0&&ents[e.att].alive&&ents[e.att].team!=e.team)e.ls={x:ents[e.att].x,z:ents[e.att].z,t:6}}}
  var tg=e.tg>=0?ents[e.tg]:null;if(tg&&!tg.alive){tg=null;e.tg=-1}
  var mx=0,mz=0;
  if(tg){var dx=tg.x-e.x,dz=tg.z-e.z,bd=Math.hypot(dx,dz)||1,rad=bd>wp.ideal+3?1:bd<wp.ideal-3?-1:0;if(e.hp<30)rad=-1;
   if(e.stt<=0){e.st=Math.random()<.5?-1:1;e.stt=.6+Math.random()*1.4}
   mx=dx/bd*rad+(-dz/bd)*e.st*.7;mz=dz/bd*rad+(dx/bd)*e.st*.7;e.yaw=Math.atan2(-dx,-dz);e.aim=Math.min(1,e.aim+dt*1.5);
   var a=[e.x,1.5,e.z],dd=[tg.x-a[0],1-a[1],tg.z-a[2]],Ld=Math.hypot(dd[0],dd[1],dd[2]);dd=norm(dd);
   if(e.cd<=0&&e.rx<=0&&Ld<wp.rng&&rayWalls(a,dd,Ld)>=Ld){e.cd=wp.cd*1.6+.2+Math.random()*.25;var j=.09*(1-.55*e.aim);dd[0]+=(Math.random()-.5)*j*2;dd[1]+=(Math.random()-.5)*j*1.4;dd[2]+=(Math.random()-.5)*j*2;this.shot(e,a,norm(dd),wp,.45)}
  }else{var g=null;if(e.ls&&e.ls.t>0){e.ls.t-=dt;g=e.ls}else{if(e.gt<=0){e.gx=(Math.random()-.5)*60;e.gz=e.team=='b'?-12-Math.random()*14:12+Math.random()*14;e.gt=8}e.gt-=dt;g={x:e.gx,z:e.gz};if(Math.hypot(g.x-e.x,g.z-e.z)<3)e.gt=0}
   var t=g;
   if(!visible(e.x,e.z,g.x,g.z)){if(e.nt<=0||e.nw<0||Math.hypot(WP[e.nw].x-e.x,WP[e.nw].z-e.z)<1.3){e.nt=.3;e.nw=route(e,g)}if(e.nw>=0)t=WP[e.nw]}else e.nw=-1;
   mx=t.x-e.x;mz=t.z-e.z;var Lm=Math.hypot(mx,mz)||1;mx/=Lm;mz/=Lm;e.yaw=Math.atan2(-mx,-mz)}
  for(i=0;i<12;i++){o=ents[i];if(o===e||o.team!=e.team||!o.alive)continue;var sx=e.x-o.x,sz=e.z-o.z,sd=Math.hypot(sx,sz);if(sd<2.2&&sd>.01){mx+=sx/sd*.6;mz+=sz/sd*.6}}
  var Lv=Math.hypot(mx,mz);if(Lv>1){mx/=Lv;mz/=Lv}
  e.x+=mx*4.2*dt;e.z+=mz*4.2*dt;push(e,.5)},
 snapshot:function(){var r=function(v){return Math.round(v*100)/100};
  return{t:'s',e:this.ents.map(function(e){return[r(e.x),r(e.z),r(e.yaw),Math.max(0,e.hp|0),e.alive?1:0,Math.ceil(Math.max(0,e.rt)),e.human?1:0,e.w,e.sk]}),
   n:this.ents.map(function(e){return e.human?e.name:''}),s:[this.score.b,this.score.r],o:this.over,ev:this.ev}}
};
var api={WEAPONS:WEAPONS,Game:Game,W:W,H:H,WIN:WIN,rayWalls:rayWalls,push:push};
if(typeof module!=='undefined')module.exports=api;else g.ARENA=api;
})(this);
