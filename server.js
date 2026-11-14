// Servidor do Arena 6v6 — rode com: node server.js
// Sala de espera: máx. 3 jogadores por time. Com 1+ jogador em cada time, a partida começa em 10s
// (se encher 3v3, começa em 3s). Vagas sem jogador viram bots. Com a partida em andamento, ninguém novo entra.
const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const {Game}=require('./game.js');
const PORT=process.env.PORT||3000;
const WAIT=10,WAIT_FULL=3;
const files={'/':'index.html','/index.html':'index.html','/game.js':'game.js'};
const server=http.createServer((q,r)=>{
  const f=files[q.url.split('?')[0]];
  if(!f){r.writeHead(404);return r.end('404')}
  r.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html; charset=utf-8'});
  fs.createReadStream(path.join(__dirname,f)).pipe(r);
});
const wss=new WebSocketServer({server});
const game=new Game();
let phase='lobby',cdn=-1;
game.frozen=true;
game.onOver=()=>{phase='lobby';cdn=-1;game.frozen=true;game.reset();console.log('Partida terminou. Voltando para a sala de espera.')};
const hc=t=>game.ents.filter(e=>e.human&&e.team===t).length;
function tick(dt){
  if(phase==='lobby'){
    const b=hc('b'),r=hc('r');
    if(b>0&&r>0){
      if(cdn<0)cdn=WAIT;
      cdn-=dt;
      if(b>=3&&r>=3&&cdn>WAIT_FULL)cdn=WAIT_FULL;
      if(cdn<=0){phase='match';cdn=-1;game.reset();game.frozen=false;console.log('Partida iniciada: '+b+'v'+r)}
    }else cdn=-1;
  }else if(hc('b')+hc('r')===0){
    phase='lobby';cdn=-1;game.frozen=true;game.reset();console.log('Todos saíram. Sala resetada.');
  }
  game.step(dt);
}
wss.on('connection',ws=>{
  ws.id=-1;
  ws.on('message',m=>{
    try{
      const d=JSON.parse(m);
      if(d.t==='join'&&ws.id<0){
        if(phase!=='lobby')return ws.send(JSON.stringify({t:'busy'}));
        const id=game.join(d.team,String(d.name||'Jogador').slice(0,14),d.skin);
        if(id<0)return ws.send(JSON.stringify({t:'full'}));
        ws.id=id;ws.send(JSON.stringify({t:'welcome',id}));
        console.log('Entrou:',game.ents[id].name,'time',game.ents[id].team);
      }else if(ws.id>=0&&d.t==='p')game.setPos(ws.id,+d.x,+d.z,+d.y);
      else if(ws.id>=0&&d.t==='f')game.shoot(ws.id,d.o,d.d,d.w);
    }catch(e){}
  });
  ws.on('close',()=>{if(ws.id>=0){console.log('Saiu:',game.ents[ws.id].name);game.leave(ws.id)}});
});
setInterval(()=>{
  tick(1/30);
  const sn=game.snapshot();sn.ph=phase==='lobby'?'l':'m';sn.c=cdn<0?-1:Math.ceil(cdn);
  game.ev=[];
  const s=JSON.stringify(sn);
  wss.clients.forEach(c=>{if(c.readyState===1)c.send(s)});
},1000/30);
server.listen(PORT,'0.0.0.0',()=>console.log('Arena 6v6 rodando na porta '+PORT+'. Abra http://IP-DA-TV-BOX:'+PORT));
