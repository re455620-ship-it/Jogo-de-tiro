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
wss.on('connection',ws=>{
  ws.id=-1;
  ws.on('message',m=>{
    try{
      const d=JSON.parse(m);
      if(d.t==='join'&&ws.id<0){
        const id=game.join(d.team,String(d.name||'Jogador').slice(0,14));
        if(id<0)return ws.send(JSON.stringify({t:'full'}));
        ws.id=id;ws.send(JSON.stringify({t:'welcome',id}));
        console.log('Entrou:',game.ents[id].name,'time',game.ents[id].team);
      }else if(ws.id>=0&&d.t==='p')game.setPos(ws.id,+d.x,+d.z,+d.y);
      else if(ws.id>=0&&d.t==='f')game.shoot(ws.id,d.o,d.d);
    }catch(e){}
  });
  ws.on('close',()=>{if(ws.id>=0){console.log('Saiu:',game.ents[ws.id].name);game.leave(ws.id)}});
});
setInterval(()=>{
  game.step(1/30);
  const s=JSON.stringify(game.snapshot());game.ev=[];
  wss.clients.forEach(c=>{if(c.readyState===1)c.send(s)});
},1000/30);
server.listen(PORT,'0.0.0.0',()=>console.log('Arena 6v6 rodando na porta '+PORT+'. Abra http://IP-DA-TV-BOX:'+PORT));
