const SYSTEM = `Du är en svensk, empatisk, evidensinformerad coach inom folkhälsa och sysselsättning. Svara på svenska. Skilj alltid självskattning från objektiva fakta. Bygg på varje enskilt svar, särskilt kontraster mellan frågor. Negativt formulerade frågor om stress, grubblerier och rolloro har omvänd innebörd. Ställ inga diagnoser och påstå inte att du vet mer än svaren visar. Undvik absoluta omdömen och skam. Föreslå realistiska, frivilliga små steg. Skriv tydliga rubriker och korta stycken. Vid akut fara: rekommendera akut hjälp.`;
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const headers = {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Cache-Control":"no-store"};
export default async (request) => {
  if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
  if (request.method !== "POST") return new Response(JSON.stringify({error:"Endast POST tillåts."}),{status:405,headers});
  if (allowedOrigin !== "*" && request.headers.get("origin") !== allowedOrigin) return new Response(JSON.stringify({error:"Otillåtet ursprung."}),{status:403,headers});
  if (!process.env.OPENAI_API_KEY) return new Response(JSON.stringify({error:"OPENAI_API_KEY saknas i serverns miljövariabler."}),{status:503,headers});
  try {
    const body = await request.json();
    if (!Array.isArray(body.answers) || body.answers.length!==25 ||
        !body.answers.every(a=>typeof a.question==="string" && a.question.length<350 && typeof a.category==="string" && a.category.length<100 && Number.isInteger(a.value) && a.value>=1 && a.value<=5)) {
      return new Response(JSON.stringify({error:"25 giltiga svar krävs."}),{status:400,headers});
    }
    const mode=body.mode==="followup"?"followup":"analysis";
    const reflection=typeof body.reflection==="string"?body.reflection.slice(0,1200):"";
    const instructions=mode==="analysis"
      ? "Ge: 1) personlig sammanfattning, 2) tre styrkor, 3) tre prioriterade utvecklingsområden, 4) fyra veckors handlingsplan med genomförbara steg, 5) två öppna reflektionsfrågor. Högst 650 ord."
      : "Besvara användarens reflektion med två coachande insikter, tre konkreta nästa steg och en öppen följdfråga. Högst 300 ord.";
    const api=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || "gpt-4.1-mini",store:false,max_output_tokens:1400,
        instructions:SYSTEM+" "+instructions,
        input:JSON.stringify({test:"Sysselsättning – Skattningstest",scale:"1=stämmer inte alls, 5=stämmer helt",answers:body.answers,reflection:mode==="followup"?reflection:undefined})})
    });
    const data=await api.json();
    if(!api.ok) {console.error("OpenAI API error",api.status,data?.error?.code);return new Response(JSON.stringify({error:"AI-tjänsten kunde inte skapa svaret. Kontrollera API-nyckel, modell och fakturering."}),{status:502,headers})}
    const output=(data.output||[]).flatMap(item=>(item.content||[]).filter(x=>x.type==="output_text").map(x=>x.text)).join("\\n").trim();
    if(!output)throw Error("Empty output");
    return new Response(JSON.stringify({text:output}),{status:200,headers});
  } catch(e) {console.error(e);return new Response(JSON.stringify({error:"Ett serverfel inträffade. Försök igen."}),{status:500,headers})}
};
export const config={path:"/.netlify/functions/coach"};
