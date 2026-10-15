const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const crypto=require('crypto');
const app=express(),server=http.createServer(app),io=new Server(server);
app.use(express.static('public'));
const HOST=process.env.HOST_PASSWORD;
if(!HOST) console.warn('Set HOST_PASSWORD before public deployment.');
const seed=[['AAPL','Apple',195],['NVDA','Nvidia',135],['TSLA','Tesla',250],['DIS','Disney',110],['NKE','Nike',95],['SBUX','Starbucks',88]];
let stocks=seed.map(([symbol,name,price])=>({symbol,name,price,initial:price}));
let players={},tokens={},round=0,started=false,ended=false,news='Welcome to the DSP trading floor!',history=[];
const events=[['Tech stocks surge after strong earnings',{AAPL:1.09,NVDA:1.17,TSLA:1.04}],['Consumers pull back on spending',{DIS:.90,NKE:.88,SBUX:.92}],['Electric vehicle demand surprises analysts',{TSLA:1.20,AAPL:.98}],['Chip supply shortage hits manufacturers',{NVDA:.82,AAPL:.94}],['Holiday sales beat expectations',{NKE:1.13,SBUX:1.11,DIS:1.08}],['Broad market correction rattles investors',{AAPL:.93,NVDA:.90,TSLA:.87,DIS:.95,NKE:.94,SBUX:.96}],['New streaming hit lifts entertainment stocks',{DIS:1.18}],['AI investment boom accelerates',{NVDA:1.19,AAPL:1.06}],['Coffee chain announces major expansion',{SBUX:1.17}],['Markets rally into the closing bell',{AAPL:1.07,NVDA:1.08,TSLA:1.07,DIS:1.06,NKE:1.06,SBUX:1.06}]];
const clean=s=>String(s||'').trim().slice(0,30);
const worth=p=>Math.round((p.cash+stocks.reduce((a,s)=>a+(p.holdings[s.symbol]||0)*s.price,0))*100)/100;
const board=()=>Object.values(players).map(p=>({id:p.id,name:p.name,value:worth(p),cash:p.cash,holdings:p.holdings})).sort((a,b)=>b.value-a.value);
function publish(){io.emit('state',{stocks,round,started,ended,news,history:history.slice(-10),leaderboard:board(),count:Object.keys(players).length});}
function reply(cb,obj){if(typeof cb==='function')cb(obj)}
io.on('connection',socket=>{
 socket.emit('state',{stocks,round,started,ended,news,history:history.slice(-10),leaderboard:board(),count:Object.keys(players).length});
 socket.on('join',({name,token}={},cb)=>{
  name=clean(name);if(!name)return reply(cb,{error:'Enter a name.'});
  if(token&&tokens[token]&&players[tokens[token]]){socket.data.pid=tokens[token];return reply(cb,{ok:true,token,player:players[socket.data.pid]});}
  if(started||ended)return reply(cb,{error:'The game has already started. Ask the host to reset for new players.'});
  if(Object.keys(players).length>=30)return reply(cb,{error:'Game is full (30 players).'});
  if(Object.values(players).some(p=>p.name.toLowerCase()===name.toLowerCase()))return reply(cb,{error:'Name already taken.'});
  const id=crypto.randomUUID(),newToken=crypto.randomBytes(24).toString('hex');
  players[id]={id,name,cash:10000,holdings:{}};tokens[newToken]=id;socket.data.pid=id;
  reply(cb,{ok:true,token:newToken,player:players[id]});publish();
 });
 socket.on('resume',({token}={},cb)=>{if(token&&tokens[token]&&players[tokens[token]]){socket.data.pid=tokens[token];reply(cb,{ok:true,player:players[socket.data.pid]})}else reply(cb,{error:'Session expired. Join a new game.'})});
 socket.on('trade',({symbol,side,quantity}={},cb)=>{
  const p=players[socket.data.pid],s=stocks.find(s=>s.symbol===symbol);quantity=Number(quantity);
  if(!p||!started||ended||!s||!['buy','sell'].includes(side)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100000)return reply(cb,{error:'Invalid trade or trading is closed.'});
  const cost=Math.round(s.price*quantity*100)/100;
  if(side==='buy'){if(p.cash+1e-8<cost)return reply(cb,{error:'Not enough cash.'});p.cash=Math.round((p.cash-cost)*100)/100;p.holdings[symbol]=(p.holdings[symbol]||0)+quantity}
  else {if((p.holdings[symbol]||0)<quantity)return reply(cb,{error:'Not enough shares.'});p.holdings[symbol]-=quantity;p.cash=Math.round((p.cash+cost)*100)/100}
  reply(cb,{ok:true,player:p,message:`${side==='buy'?'Bought':'Sold'} ${quantity} ${symbol} shares`});publish();
 });
 socket.on('host',({password,action}={},cb)=>{
  if(!HOST||typeof password!=='string'||password!==HOST)return reply(cb,{error:'Incorrect host password or server not configured.'});
  if(action==='start'){if(ended)return reply(cb,{error:'Reset before starting again.'});started=true;news='Trading is open!';}
  else if(action==='next'){if(!started||ended||round>=events.length)return reply(cb,{error:'Cannot advance round.'});const [headline,changes]=events[round];round++;stocks=stocks.map(s=>({...s,price:Math.round(s.price*(changes[s.symbol]||1)*100)/100}));news=headline;history.push({round,headline});if(round===events.length){ended=true;started=false;}}
  else if(action==='finish'){ended=true;started=false;news='Market closed. Final results are in!';}
  else if(action==='reset'){stocks=seed.map(([symbol,name,price])=>({symbol,name,price,initial:price}));players={};tokens={};round=0;started=false;ended=false;news='Welcome to the DSP trading floor!';history=[];io.emit('reset');}
  else return reply(cb,{error:'Unknown action.'});
  reply(cb,{ok:true});publish();
 });
});
app.get('/health',(req,res)=>res.json({ok:true,players:Object.keys(players).length}));
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('DSP game ready'));
