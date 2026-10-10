import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
export async function GET(request: Request, context: {params: Promise<{id:string}>}) {
  const { id } = await context.params;
  const token=request.headers.get('X-Viewing-Token');
  const headers={'Cache-Control':'no-store'};
  if (!/^(?:[a-fA-F0-9]{24}|HOM-\d{8}-[A-F0-9]{6})$/.test(id) || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return NextResponse.json({error:{message:'Viewing status unavailable'}},{status:404,headers});
  try {
    const response=await fetch(`${config.apiBaseUrl}/bookings/${encodeURIComponent(id)}/status`,{headers:{'X-Viewing-Token':token,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok) return NextResponse.json({error:{message:'Viewing status unavailable'}},{status:response.status===404?404:503,headers});
    const {data}=await response.json();
    return NextResponse.json({data:{reference:data.reference,scheduledAt:data.scheduledAt,status:data.status,updatedAt:data.updatedAt}},{headers});
  } catch {return NextResponse.json({error:{message:'Could not refresh viewing status. Your saved copy is kept.'}},{status:503,headers});}
}
