// Servidor do Arena 6v6 — rode com: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const {Game}=require('./game.js');
const PORT=process.env.PORT||3000;
const files={'/':'index.html','/index.html':'index.html','/game.js':'game.js'};
const server=http.createServer((q,r)=>{
  const f=files[q.url.split('?')[0]];
  if(!f){r.writeHead(404);return r.end('404')}
  r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html; charset=utf-8'});
  fs.createReadStream(path.join(__dirname,f)).pipe(r);
});
const wss=new WebSocketServer({server});
const game=new Game();
let phase='l',cd=-1; // 'l' = sala de espera | 'm' = partida em andamento
game.frozen=true;
const count=t=>game.ents.filter(e=>e.human&&e.team===t).length;
function toLobby(){phase='l';cd=-1;game.frozen=true;game.reset();console.log('Sala de espera aberta')}
function start(){phase='m';cd=-1;game.reset();game.frozen=false;console.log('Partida iniciada:',count('b')+'v'+count('r'))}
game.onOver=toLobby; // fim da partida -> volta para a sala de espera
wss.on('connection',ws=>{
  ws.id=-1;
  ws.on('message',m=>{
    try{
      const d=JSON.parse(m);
      if(d.t==='join'&&ws.id<0){
        if(phase!=='l')return ws.send(JSON.stringify({t:'busy'}));   // partida já criada: ninguém entra
        const id=game.join(d.team,String(d.name||'Jogador').slice(0,14),d.skin);
        if(id<0)return ws.send(JSON.stringify({t:'full'}));
        ws.id=id;ws.send(JSON.stringify({t:'welcome',id}));
        console.log('Entrou:',game.ents[id].name,'time',game.ents[id].team);
      }else if(ws.id>=0&&phase==='m'&&d.t==='p')game.setPos(ws.id,+d.x,+d.z,+d.y);
      else if(ws.id>=0&&phase==='m'&&d.t==='f')game.shoot(ws.id,d.o,d.d,d.w);
    }catch(e){}
  });
  ws.on('close',()=>{
    if(ws.id>=0){console.log('Saiu:',game.ents[ws.id].name);game.leave(ws.id)}
    if(phase==='m'&&!game.ents.some(e=>e.human))toLobby();
  });
});
setInterval(()=>{
  const dt=1/30;
  if(phase==='m')game.step(dt);
  else{
    const hb=count('b'),hr=count('r');
    if(hb>=1&&hr>=1){
      const want=(hb>=3&&hr>=3)?3:10;          // 3v3 cheio: 3s | senão: 10s
      if(cd<0||cd>want)cd=want;
      cd-=dt;if(cd<=0)start();
    }else cd=-1;
  }
  const snap=game.snapshot();
  snap.ph=phase;snap.c=cd>0?Math.ceil(cd):-1;
  const s=JSON.stringify(snap);game.ev=[];
  wss.clients.forEach(c=>{if(c.readyState===1)c.send(s)});
},1000/30);
server.listen(PORT,'0.0.0.0',()=>console.log('Arena 6v6 rodando na porta '+PORT+'. Abra http://IP-DO-SERVIDOR:'+PORT));
module.exports={game};
