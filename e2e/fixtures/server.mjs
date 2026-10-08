// Isolated browser QA only. Never connects to Render or writes to a database.
import http from 'node:http';
const photos=['1600585154340-be6161a56a0c','1522708323590-d24dbb6b0267','1600566753086-00f18fb6b3ea','1600607687939-ce8a6c25118c','1500382017468-9049fed747ef'];
const properties=Array.from({length:8},(_,i)=>({
 _id:`507f1f77bcf86cd7994390${String(i+11).padStart(2,'0')}`,slug:`illustrative-home-${i+1}`,title:['Garden home in Ntinda','An apartment with room to breathe','A quiet short stay','Light-filled family home','Space for your next chapter','An apartment close to the city','A calm garden retreat','A place to make your own'][i],
 description:'Illustrative property for isolated design and browser testing. This is not a live listing. A bright, open living space with a sheltered terrace and room to settle in.',
 purpose:i===2?'short_stay':i===3?'sale':'rent',type:i===1?'apartment':'house',price:{amount:i===3?480000000:1500000+i*350000,currency:'UGX',period:i===3?'total':i===2?'night':'month'},
 location:{country:'Uganda',region:'Central',district:'Kampala',area:['Ntinda','Bukoto','Muyenga','Naguru'][i%4],address:'Illustrative location, Kampala'},bedrooms:3,bathrooms:2,size:180,sizeUnit:'sqm',amenities:['Parking','Garden','Security','Water storage'],tags:['test:visual-v2'],media:photos.map(p=>({type:'image',url:`/images/${p}.jpg`,alt:'Illustrative architectural photography'})),cover:{type:'image',url:`/images/${photos[i%5]}.jpg`,alt:'Illustrative architectural photography'},agent:{_id:'507f1f77bcf86cd799439099',name:'Douglas (QA fixture)'},featured:true,verificationStatus:i===0?'verified':'unverified',status:'published',viewCount:i,publishedAt:'2026-10-01T12:00:00Z'
}));
let writes=[];
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1:3100');res.setHeader('Content-Type','application/json');res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:3101');res.setHeader('Access-Control-Allow-Headers','Content-Type,Idempotency-Key');
 const send=(body,status=200)=>{res.writeHead(status);res.end(JSON.stringify(body));};
 if(req.method==='OPTIONS')return send({});
 if(u.pathname==='/__qa/writes')return send({writes});
 if(req.method==='POST'){
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=JSON.parse(Buffer.concat(chunks));writes.push({path:u.pathname,body,idempotency:req.headers['idempotency-key']});
  if(u.pathname.endsWith('/bookings'))return send({data:{_id:'local-booking',reference:'HOMES-QA-ONLY',status:'pending',scheduledAt:body.scheduledAt,createdAt:new Date().toISOString()}},201);
  return send({data:{id:'local-inquiry'},message:'Your test message has been received.'},201);
 }
 if(u.pathname==='/api/v1/properties'){
  let data=properties.filter(p=>['purpose','type','area','district'].every(k=>!u.searchParams.get(k)||(p[k]??p.location[k])===u.searchParams.get(k)));
  if(u.searchParams.get('q')==='empty')data=[];
  if(u.searchParams.get('verified')==='true')data=data.filter(p=>p.verificationStatus==='verified');
  const sort=u.searchParams.get('sort');if(sort==='price_asc'||sort==='price_desc')data.sort((a,b)=>(a.price.amount-b.price.amount)*(sort==='price_asc'?1:-1));
  const total=data.length,limit=Number(u.searchParams.get('limit')||20),page=Number(u.searchParams.get('page')||1);
  return send({data:data.slice((page-1)*limit,page*limit),pagination:{page,limit,total,pages:Math.ceil(total/limit)}});
 }
 if(u.pathname.startsWith('/api/v1/properties/')){const p=properties.find(p=>p._id===u.pathname.split('/').at(-1));return p?send({data:p}):send({error:{message:'Property not found'}},404);}
 if(u.pathname==='/api/v1/agents'||u.pathname==='/api/v1/agencies')return send({data:[],pagination:{page:1,limit:50,total:0,pages:0}});
 send({error:{message:'Unknown fixture route'}},404);
}).listen(3100,'127.0.0.1',()=>console.log('Isolated visual QA API on 127.0.0.1:3100'));
