import{useState,useEffect,useCallback}from'react'
  type G=number[][]
  const N=4
  const mk=():G=>Array.from({length:N},()=>Array(N).fill(0))
  const addRnd=(g:G)=>{const e:number[][]=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!g[r][c])e.push([r,c]);if(!e.length)return;const[r,c]=e[Math.floor(Math.random()*e.length)];g[r][c]=Math.random()<0.9?2:4}
  const init=():G=>{const g=mk();addRnd(g);addRnd(g);return g}
  const slide=(row:number[])=>{const f=row.filter(Boolean);let sc=0;for(let i=0;i<f.length-1;i++)if(f[i]===f[i+1]){f[i]*=2;sc+=f[i];f.splice(i+1,1)}while(f.length<N)f.push(0);return{r:f,sc}}
  const BG:{[k:number]:string}={0:"#1e293b",2:"#334155",4:"#475569",8:"#0ea5e9",16:"#0284c7",32:"#6366f1",64:"#7c3aed",128:"#22c55e",256:"#16a34a",512:"#f59e0b",1024:"#d97706",2048:"#ef4444"}
  export default function App(){
    const[g,setG]=useState(init)
    const[sc,setSc]=useState(0)
    const[best,setBest]=useState(0)
    const[won,setWon]=useState(false)
    const[lost,setLost]=useState(false)
    const restart=()=>{setG(init());setSc(0);setWon(false);setLost(false)}
    const move=useCallback((dir:"l"|"r"|"u"|"d")=>{
      if(won||lost)return
      setG(prev=>{
        let ng=prev.map(r=>[...r]);let total=0;let moved=false
        const applyRow=(row:number[],rev=false)=>{const inp=rev?[...row].reverse():row;const{r:nr,sc:s}=slide(inp);total+=s;const out=rev?[...nr].reverse():nr;if(out.join()!==row.join())moved=true;return out}
        if(dir==="l")ng=ng.map(r=>applyRow(r))
        else if(dir==="r")ng=ng.map(r=>applyRow(r,true))
        else{
          const T=ng[0].map((_,c)=>ng.map(r=>r[c]))
          const res=T.map(r=>applyRow(r,dir==="d"))
          ng=res[0].map((_,ri)=>res.map(col=>col[ri]))
          if(res.flat().join()!==T.flat().join())moved=true
        }
        if(!moved&&!total)return prev
        if(total){setSc(s=>{const ns=s+total;setBest(b=>Math.max(b,ns));return ns})}
        addRnd(ng)
        if(ng.flat().includes(2048))setWon(true)
        else{const ok=()=>{for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(!ng[r][c])return true;if(c<N-1&&ng[r][c]===ng[r][c+1])return true;if(r<N-1&&ng[r][c]===ng[r+1][c])return true}return false};if(!ok())setLost(true)}
        return ng
      })
    },[won,lost])
    useEffect(()=>{
      const m:{[k:string]:"l"|"r"|"u"|"d"}={ArrowLeft:"l",ArrowRight:"r",ArrowUp:"u",ArrowDown:"d"}
      const h=(e:KeyboardEvent)=>{const d=m[e.key];if(d){e.preventDefault();move(d)}}
      window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)
    },[move])
    return(
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",padding:"2rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:328}}>
          <div style={{fontWeight:900,fontSize:"2.2rem",color:"#f59e0b"}}>2048</div>
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            {[{l:"SCORE",v:sc,c:"#38bdf8"},{l:"BEST",v:best,c:"#22c55e"}].map(({l,v,c})=>(
              <div key={l} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:8,padding:"0.4rem 0.75rem",textAlign:"center",minWidth:68}}>
                <div style={{fontSize:"1rem",fontWeight:800,color:c}}>{v}</div>
                <div style={{color:"#475569",fontSize:"0.65rem"}}>{l}</div>
              </div>
            ))}
            <button onClick={restart} style={{padding:"0.4rem 0.75rem",background:"#f59e0b",color:"#0f172a",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:"0.8rem"}}>New</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,74px)",gap:6,background:"#111827",padding:6,borderRadius:10,border:"2px solid #1e293b",position:"relative"}}>
          {g.flat().map((v,i)=>(
            <div key={i} style={{width:74,height:74,background:BG[v>2048?2048:v]||"#7f1d1d",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:v>=1000?"1.1rem":v>=100?"1.3rem":"1.7rem",color:v<=4?"#cbd5e1":"#fff"}}>{v||""}</div>
          ))}
          {(won||lost)&&(
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:9,gap:"0.75rem"}}>
              <div style={{fontSize:"2.5rem"}}>{won?"🏆":"😢"}</div>
              <div style={{fontWeight:800,fontSize:"1.4rem",color:won?"#f59e0b":"#f87171"}}>{won?"You Win!":"Game Over"}</div>
              <button onClick={restart} style={{padding:"0.6rem 1.75rem",background:won?"#f59e0b":"#0ea5e9",color:won?"#0f172a":"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700}}>Play Again</button>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          {[["←","l"],["→","r"],["↑","u"],["↓","d"]].map(([label,dir])=>(
            <button key={label} onClick={()=>move(dir as"l"|"r"|"u"|"d")} style={{width:44,height:44,background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",borderRadius:8,cursor:"pointer",fontSize:"1rem"}}>{label}</button>
          ))}
        </div>
        <p style={{color:"#334155",fontSize:"0.73rem"}}>Arrow keys to slide tiles</p>
      </div>
    )
  }