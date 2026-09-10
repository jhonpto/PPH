import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, Banknote, Check, ChevronRight, ClipboardCopy,
  CreditCard, Download, FileText, Home, LogOut, MessageCircle, Plus,
  ReceiptText, Search, Settings, Store as StoreIcon, Trash2, Users, X
} from 'lucide-react'
import { supabase, supabaseConfigured } from './supabase'

type Store = { id:string; name:string; phone:string; note:string; created_at:string }
type Service = { id:string; store_id:string; service_date:string; device:string; description:string; amount:number; created_at:string }
type Payment = { id:string; store_id:string; paid_at:string; amount:number; method:string; note:string; created_at:string }
type Allocation = { id:string; payment_id:string; service_id:string; amount:number }
type DataSet = { stores:Store[]; services:Service[]; payments:Payment[]; allocations:Allocation[] }
type View = 'dashboard'|'stores'|'payments'|'settings'|'store'

const money = (n:number) => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const dateBR = (s:string) => new Date(s+'T12:00:00').toLocaleDateString('pt-BR')
const today = () => new Date().toISOString().slice(0,10)
const monthStart = () => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10) }
const uid = () => crypto.randomUUID()
const digits = (s:string) => s.replace(/\D/g,'')
const localKey='centro-contas-v1'
const settingsKey='centro-contas-settings'

function loadLocal():DataSet {
  const raw=localStorage.getItem(localKey)
  return raw ? JSON.parse(raw) : {stores:[],services:[],payments:[],allocations:[]}
}
function saveLocal(d:DataSet){ localStorage.setItem(localKey,JSON.stringify(d)) }

export default function App(){
  const [session,setSession]=useState<any>(null)
  const [authLoading,setAuthLoading]=useState(supabaseConfigured)
  const [data,setData]=useState<DataSet>({stores:[],services:[],payments:[],allocations:[]})
  const [loading,setLoading]=useState(true)
  const [view,setView]=useState<View>('dashboard')
  const [selectedStoreId,setSelectedStoreId]=useState<string>('')
  const [toast,setToast]=useState('')
  const [settings,setSettings]=useState(()=>JSON.parse(localStorage.getItem(settingsKey)||'{"businessName":"Centro do Reparo"}'))

  useEffect(()=>{
    if(!supabaseConfigured){ setData(loadLocal()); setLoading(false); setAuthLoading(false); return }
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false)})
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return ()=>sub.subscription.unsubscribe()
  },[])

  useEffect(()=>{
    if(!supabaseConfigured || !session) return
    refresh()
  },[session])

  const flash=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),2200)}

  async function refresh(){
    setLoading(true)
    const [a,b,c,d]=await Promise.all([
      supabase.from('stores').select('*').order('name'),
      supabase.from('services').select('*').order('service_date',{ascending:false}),
      supabase.from('payments').select('*').order('paid_at',{ascending:false}),
      supabase.from('payment_allocations').select('*')
    ])
    const err=a.error||b.error||c.error||d.error
    if(err) flash('Erro ao carregar: '+err.message)
    else setData({stores:a.data||[],services:b.data||[],payments:c.data||[],allocations:d.data||[]})
    setLoading(false)
  }

  function mutateLocal(fn:(d:DataSet)=>DataSet){
    const next=fn(structuredClone(data)); setData(next); saveLocal(next)
  }

  async function addStore(payload:{name:string;phone:string;note:string}){
    if(supabaseConfigured){
      const {error}=await supabase.from('stores').insert(payload); if(error) throw error; await refresh()
    } else mutateLocal(d=>({...d,stores:[...d.stores,{id:uid(),...payload,created_at:new Date().toISOString()}]}))
    flash('Lojista cadastrado')
  }

  async function addService(payload:{store_id:string;service_date:string;device:string;description:string;amount:number}){
    if(supabaseConfigured){
      const {error}=await supabase.from('services').insert(payload); if(error) throw error; await refresh()
    } else mutateLocal(d=>({...d,services:[{id:uid(),...payload,created_at:new Date().toISOString()},...d.services]}))
    flash('Serviço lançado')
  }

  async function deleteService(id:string){
    if(supabaseConfigured){ const {error}=await supabase.from('services').delete().eq('id',id); if(error) throw error; await refresh() }
    else mutateLocal(d=>({...d,services:d.services.filter(x=>x.id!==id)}))
    flash('Serviço removido')
  }

  async function recordPayment(storeId:string, selectedServiceIds:string[], amount:number, method:string, note:string){
    const outstanding=(id:string)=>serviceOutstanding(id,data)
    const selected=data.services.filter(s=>selectedServiceIds.includes(s.id)).sort((a,b)=>a.service_date.localeCompare(b.service_date))
    const cap=selected.reduce((sum,s)=>sum+outstanding(s.id),0)
    if(amount<=0 || amount>cap+0.001) throw new Error('Valor inválido para os serviços selecionados.')
    let remaining=amount
    const allocations:{service_id:string;amount:number}[]=[]
    for(const s of selected){
      if(remaining<=0) break
      const part=Math.min(outstanding(s.id),remaining)
      if(part>0){allocations.push({service_id:s.id,amount:+part.toFixed(2)});remaining=+(remaining-part).toFixed(2)}
    }
    if(supabaseConfigured){
      const {data:p,error}=await supabase.from('payments').insert({store_id:storeId,paid_at:today(),amount,method,note}).select().single()
      if(error) throw error
      const rows=allocations.map(a=>({payment_id:p.id,...a}))
      const {error:err2}=await supabase.from('payment_allocations').insert(rows)
      if(err2){ await supabase.from('payments').delete().eq('id',p.id); throw err2 }
      await refresh()
    } else {
      mutateLocal(d=>{
        const pid=uid();
        d.payments.unshift({id:pid,store_id:storeId,paid_at:today(),amount,method,note,created_at:new Date().toISOString()})
        d.allocations.push(...allocations.map(a=>({id:uid(),payment_id:pid,...a})))
        return d
      })
    }
    flash('Pagamento registrado')
  }

  async function deleteStore(id:string){
    if(supabaseConfigured){ const {error}=await supabase.from('stores').delete().eq('id',id); if(error) throw error; await refresh() }
    else mutateLocal(d=>{ const serviceIds=d.services.filter(s=>s.store_id===id).map(s=>s.id); const payIds=d.payments.filter(p=>p.store_id===id).map(p=>p.id); return {stores:d.stores.filter(s=>s.id!==id),services:d.services.filter(s=>s.store_id!==id),payments:d.payments.filter(p=>p.store_id!==id),allocations:d.allocations.filter(a=>!serviceIds.includes(a.service_id)&&!payIds.includes(a.payment_id))} })
    setView('stores'); setSelectedStoreId(''); flash('Lojista removido')
  }

  function openStore(id:string){setSelectedStoreId(id);setView('store')}

  if(authLoading) return <Center><div className="loader"/></Center>
  if(supabaseConfigured && !session) return <AuthScreen/>

  const store=data.stores.find(s=>s.id===selectedStoreId)
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">CR</div><div><b>Centro Contas</b><small>{settings.businessName}</small></div></div>
      <NavButton active={view==='dashboard'} icon={<Home/>} label="Visão geral" onClick={()=>setView('dashboard')}/>
      <NavButton active={view==='stores'||view==='store'} icon={<Users/>} label="Lojistas" onClick={()=>setView('stores')}/>
      <NavButton active={view==='payments'} icon={<ReceiptText/>} label="Pagamentos" onClick={()=>setView('payments')}/>
      <NavButton active={view==='settings'} icon={<Settings/>} label="Ajustes" onClick={()=>setView('settings')}/>
      <div className="sidebar-foot">{supabaseConfigured?<button className="text-button" onClick={()=>supabase.auth.signOut()}><LogOut size={17}/> Sair</button>:<span className="mode-pill">Modo local</span>}</div>
    </aside>

    <main className="main">
      {!supabaseConfigured && <div className="local-banner"><AlertTriangle size={18}/><span><b>Modo local:</b> pronto para testar. Configure o Supabase para sincronizar entre aparelhos.</span></div>}
      {loading?<Center><div className="loader"/></Center>:
        view==='dashboard'?<Dashboard data={data} onOpenStore={openStore} onNewService={(id)=>{setSelectedStoreId(id);setView('store')}}/>:
        view==='stores'?<StoresPage data={data} onOpenStore={openStore} onAdd={addStore}/>:
        view==='payments'?<PaymentsPage data={data} businessName={settings.businessName}/>:
        view==='settings'?<SettingsPage settings={settings} onSave={(s:any)=>{setSettings(s);localStorage.setItem(settingsKey,JSON.stringify(s));flash('Ajustes salvos')}} online={supabaseConfigured}/>:
        store?<StorePage store={store} data={data} onBack={()=>setView('stores')} onAddService={addService} onDeleteService={deleteService} onPayment={recordPayment} onDeleteStore={deleteStore} businessName={settings.businessName}/>:null}
    </main>

    <nav className="bottom-nav">
      <NavButton active={view==='dashboard'} icon={<Home/>} label="Início" onClick={()=>setView('dashboard')}/>
      <NavButton active={view==='stores'||view==='store'} icon={<Users/>} label="Lojistas" onClick={()=>setView('stores')}/>
      <NavButton active={view==='payments'} icon={<ReceiptText/>} label="Pagamentos" onClick={()=>setView('payments')}/>
      <NavButton active={view==='settings'} icon={<Settings/>} label="Ajustes" onClick={()=>setView('settings')}/>
    </nav>
    {toast&&<div className="toast"><Check size={18}/>{toast}</div>}
  </div>
}

function Center({children}:{children:any}){return <div className="center">{children}</div>}
function NavButton({active,icon,label,onClick}:{active:boolean;icon:any;label:string;onClick:()=>void}){return <button className={'nav-button '+(active?'active':'')} onClick={onClick}>{icon}<span>{label}</span></button>}

function AuthScreen(){
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [mode,setMode]=useState<'login'|'signup'>('login'); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(e:any){e.preventDefault();setBusy(true);setMsg(''); const r=mode==='login'?await supabase.auth.signInWithPassword({email,password:pass}):await supabase.auth.signUp({email,password:pass}); if(r.error)setMsg(r.error.message); else if(mode==='signup')setMsg('Conta criada. Se a confirmação de e-mail estiver ativa, confirme antes de entrar.'); setBusy(false)}
  return <Center><div className="auth-card"><div className="brand-mark big">CR</div><h1>Centro Contas</h1><p>Controle de contas a receber dos lojistas.</p><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={pass} minLength={6} onChange={e=>setPass(e.target.value)} required/></label><button className="primary full" disabled={busy}>{busy?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</button></form>{msg&&<div className="form-msg">{msg}</div>}<button className="link" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Primeiro acesso? Criar conta':'Já tenho conta'}</button></div></Center>
}

function Dashboard({data,onOpenStore,onNewService}:{data:DataSet;onOpenStore:(id:string)=>void;onNewService:(id:string)=>void}){
  const [q,setQ]=useState('')
  const totals=useMemo(()=>{
    const open=data.services.reduce((s,x)=>s+serviceOutstanding(x.id,data),0)
    const received=data.payments.filter(p=>p.paid_at>=monthStart()).reduce((s,p)=>s+p.amount,0)
    const debtorIds=new Set(data.services.filter(s=>serviceOutstanding(s.id,data)>0.009).map(s=>s.store_id))
    const old=data.services.filter(s=>serviceOutstanding(s.id,data)>0.009 && ageDays(s.service_date)>30).reduce((a,s)=>a+serviceOutstanding(s.id,data),0)
    return {open,received,debtors:debtorIds.size,old}
  },[data])
  const rows=data.stores.map(st=>({st,open:storeOpen(st.id,data),old:storeOld(st.id,data)})).filter(x=>x.open>0.009 && x.st.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.open-a.open)
  return <Page>
    <Header title="Visão geral" subtitle="Tudo que está na rua, sem precisar somar nada."/>
    <div className="metric-grid"><Metric label="Em aberto" value={money(totals.open)} strong/><Metric label="Recebido no mês" value={money(totals.received)}/><Metric label="Lojistas devendo" value={String(totals.debtors)}/><Metric label="+30 dias" value={money(totals.old)} warn={totals.old>0}/></div>
    <div className="section-head"><div><h2>Quem está devendo</h2><p>Ordenado pelo maior saldo em aberto.</p></div></div>
    <SearchBox value={q} onChange={setQ} placeholder="Buscar lojista"/>
    <div className="list-card">{rows.length?rows.map(({st,open,old})=><button className="debtor-row" key={st.id} onClick={()=>onOpenStore(st.id)}><div className="avatar">{st.name.slice(0,2).toUpperCase()}</div><div className="grow"><b>{st.name}</b><span>{old>0?`${money(old)} há mais de 30 dias`:'Sem atrasos acima de 30 dias'}</span></div><div className="row-money"><b>{money(open)}</b><ChevronRight/></div></button>):<Empty title="Nada em aberto" text="Quando lançar serviços para um lojista, eles aparecerão aqui."/>}</div>
  </Page>
}

function StoresPage({data,onOpenStore,onAdd}:{data:DataSet;onOpenStore:(id:string)=>void;onAdd:(p:any)=>Promise<void>}){
  const [modal,setModal]=useState(false); const [q,setQ]=useState('')
  const stores=data.stores.filter(s=>s.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name))
  return <Page><Header title="Lojistas" subtitle={`${data.stores.length} cadastrados`} action={<button className="primary" onClick={()=>setModal(true)}><Plus/>Novo lojista</button>}/><SearchBox value={q} onChange={setQ} placeholder="Buscar por nome"/><div className="list-card">{stores.map(st=><button className="debtor-row" key={st.id} onClick={()=>onOpenStore(st.id)}><div className="avatar"><StoreIcon/></div><div className="grow"><b>{st.name}</b><span>{st.phone||'Sem telefone'}</span></div><div className="row-money"><b className={storeOpen(st.id,data)>0?'danger-text':''}>{money(storeOpen(st.id,data))}</b><span>em aberto</span></div><ChevronRight/></button>)}{!stores.length&&<Empty title="Nenhum lojista" text="Cadastre seu primeiro lojista para começar."/>}</div>{modal&&<StoreModal onClose={()=>setModal(false)} onSave={async p=>{await onAdd(p);setModal(false)}}/>}</Page>
}

function StorePage({store,data,onBack,onAddService,onDeleteService,onPayment,onDeleteStore,businessName}:{store:Store;data:DataSet;onBack:()=>void;onAddService:(p:any)=>Promise<void>;onDeleteService:(id:string)=>Promise<void>;onPayment:(storeId:string,ids:string[],amount:number,method:string,note:string)=>Promise<void>;onDeleteStore:(id:string)=>Promise<void>;businessName:string}){
  const [tab,setTab]=useState<'open'|'paid'|'all'>('open'); const [serviceModal,setServiceModal]=useState(false); const [paymentModal,setPaymentModal]=useState(false); const [statement,setStatement]=useState(false); const [selected,setSelected]=useState<string[]>([])
  const services=data.services.filter(s=>s.store_id===store.id).sort((a,b)=>b.service_date.localeCompare(a.service_date))
  const visible=services.filter(s=>tab==='all'?true:tab==='open'?serviceOutstanding(s.id,data)>0.009:serviceOutstanding(s.id,data)<=0.009)
  const selectedTotal=selected.reduce((sum,id)=>sum+serviceOutstanding(id,data),0)
  const paidTotal=data.payments.filter(p=>p.store_id===store.id).reduce((s,p)=>s+p.amount,0)
  const open=storeOpen(store.id,data)
  const toggle=(id:string)=>setSelected(x=>x.includes(id)?x.filter(i=>i!==id):[...x,id])
  const openIds=visible.filter(s=>serviceOutstanding(s.id,data)>0.009).map(s=>s.id)
  return <Page>
    <button className="back" onClick={onBack}><ArrowLeft/>Lojistas</button>
    <div className="store-title"><div><h1>{store.name}</h1><p>{store.phone||'Sem WhatsApp cadastrado'}</p></div><button className="primary" onClick={()=>setServiceModal(true)}><Plus/>Novo serviço</button></div>
    <div className="metric-grid store-metrics"><Metric label="Saldo em aberto" value={money(open)} strong/><Metric label="Já recebido" value={money(paidTotal)}/><Metric label="Serviços" value={String(services.length)}/><Metric label="+30 dias" value={money(storeOld(store.id,data))} warn={storeOld(store.id,data)>0}/></div>
    <div className="action-strip"><button onClick={()=>setStatement(true)}><FileText/>Fechamento / cobrança</button>{selected.length>0&&<button className="receive" onClick={()=>setPaymentModal(true)}><Banknote/>Receber {money(selectedTotal)}</button>}</div>
    <div className="tabs"><button className={tab==='open'?'active':''} onClick={()=>{setTab('open');setSelected([])}}>Em aberto</button><button className={tab==='paid'?'active':''} onClick={()=>{setTab('paid');setSelected([])}}>Pagos</button><button className={tab==='all'?'active':''} onClick={()=>{setTab('all');setSelected([])}}>Todos</button></div>
    {tab==='open'&&visible.length>0&&<label className="select-all"><input type="checkbox" checked={openIds.length>0&&openIds.every(id=>selected.includes(id))} onChange={e=>setSelected(e.target.checked?openIds:[])}/> Selecionar todos em aberto</label>}
    <div className="service-list">{visible.map(s=>{const out=serviceOutstanding(s.id,data); const paid=s.amount-out; return <div className={'service-row '+(out<=0.009?'paid':'')} key={s.id}>{out>0.009?<input className="check" type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)}/>:<div className="paid-check"><Check/></div>}<div className="grow"><div className="service-top"><b>{s.device}</b><span>{dateBR(s.service_date)}</span></div><p>{s.description||'Serviço'}</p>{paid>0&&out>0.009&&<small>Pago {money(paid)} · Restante {money(out)}</small>}</div><div className="service-price"><b>{money(s.amount)}</b><span>{out<=0.009?'Pago':out<s.amount?`${money(out)} aberto`:'Em aberto'}</span></div>{out>0.009&&servicePaid(s.id,data)<=0.009&&<button className="icon danger" title="Excluir" onClick={()=>confirm('Excluir este lançamento?')&&onDeleteService(s.id)}><Trash2/></button>}</div>})}{!visible.length&&<Empty title={tab==='open'?'Nenhum serviço em aberto':'Nenhum lançamento aqui'} text={tab==='open'?'Esse lojista está em dia.':'Os serviços aparecerão conforme forem lançados.'}/>}</div>
    {serviceModal&&<ServiceModal storeId={store.id} onClose={()=>setServiceModal(false)} onSave={async p=>{await onAddService(p);setServiceModal(false)}}/>}
    {paymentModal&&<PaymentModal total={selectedTotal} onClose={()=>setPaymentModal(false)} onSave={async (amount,method,note)=>{await onPayment(store.id,selected,amount,method,note);setSelected([]);setPaymentModal(false)}}/>}
    {statement&&<StatementModal store={store} data={data} businessName={businessName} onClose={()=>setStatement(false)}/>}    
    <div className="danger-zone"><button className="danger-outline" onClick={()=>confirm(`Excluir ${store.name} e todo o histórico? Essa ação não pode ser desfeita.`)&&onDeleteStore(store.id)}><Trash2/>Excluir lojista</button></div>
  </Page>
}

function PaymentsPage({data,businessName}:{data:DataSet;businessName:string}){
  const [receipt,setReceipt]=useState<Payment|null>(null)
  return <Page><Header title="Pagamentos" subtitle="Histórico de tudo que entrou."/><div className="list-card">{data.payments.map(p=>{const st=data.stores.find(s=>s.id===p.store_id); const qty=data.allocations.filter(a=>a.payment_id===p.id).length; return <button className="debtor-row" onClick={()=>setReceipt(p)} key={p.id}><div className="avatar"><CreditCard/></div><div className="grow"><b>{st?.name||'Lojista removido'}</b><span>{dateBR(p.paid_at)} · {qty} serviço(s) · {p.method||'Não informado'}</span></div><div className="row-money success"><b>{money(p.amount)}</b><ChevronRight/></div></button>})}{!data.payments.length&&<Empty title="Nenhum pagamento ainda" text="As baixas realizadas aparecerão aqui."/>}</div>{receipt&&<ReceiptModal payment={receipt} data={data} businessName={businessName} onClose={()=>setReceipt(null)}/>}</Page>
}

function SettingsPage({settings,onSave,online}:{settings:any;onSave:(s:any)=>void;online:boolean}){
  const [name,setName]=useState(settings.businessName||'Centro do Reparo')
  return <Page><Header title="Ajustes" subtitle="Configurações simples do sistema."/><div className="panel narrow"><label>Nome no fechamento e recibo<input value={name} onChange={e=>setName(e.target.value)}/></label><button className="primary" onClick={()=>onSave({businessName:name})}>Salvar</button><hr/><h3>Armazenamento</h3><p>{online?'Online com Supabase. Seus dados podem ser acessados em outros aparelhos usando a mesma conta.':'Local neste navegador. Ideal para teste; para uso real configure o Supabase conforme o README.'}</p></div></Page>
}

function Header({title,subtitle,action}:{title:string;subtitle:string;action?:any}){return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
function Page({children}:{children:any}){return <div className="page">{children}</div>}
function Metric({label,value,strong,warn}:{label:string;value:string;strong?:boolean;warn?:boolean}){return <div className={'metric '+(strong?'strong ':'')+(warn?'warn':'')}><span>{label}</span><b>{value}</b></div>}
function SearchBox({value,onChange,placeholder}:{value:string;onChange:(v:string)=>void;placeholder:string}){return <div className="search"><Search/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>}
function Empty({title,text}:{title:string;text:string}){return <div className="empty"><ReceiptText/><b>{title}</b><span>{text}</span></div>}

function Modal({children,onClose,title}:{children:any;onClose:()=>void;title:string}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon" onClick={onClose}><X/></button></div>{children}</div></div>}

function StoreModal({onClose,onSave}:{onClose:()=>void;onSave:(p:any)=>Promise<void>}){
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [note,setNote]=useState(''); const [busy,setBusy]=useState(false)
  return <Modal title="Novo lojista" onClose={onClose}><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onSave({name,phone,note})}finally{setBusy(false)}}}><label>Nome do lojista / loja<input autoFocus value={name} onChange={e=>setName(e.target.value)} required/></label><label>WhatsApp<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(75) 99999-9999"/></label><label>Observação<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Opcional"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>Cadastrar</button></div></form></Modal>
}

function ServiceModal({storeId,onClose,onSave}:{storeId:string;onClose:()=>void;onSave:(p:any)=>Promise<void>}){
  const [device,setDevice]=useState(''); const [description,setDescription]=useState(''); const [amount,setAmount]=useState(''); const [date,setDate]=useState(today()); const [busy,setBusy]=useState(false)
  return <Modal title="Novo serviço" onClose={onClose}><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onSave({store_id:storeId,service_date:date,device,description,amount:Number(amount.replace(',','.'))})}finally{setBusy(false)}}}><div className="form-grid"><label>Aparelho<input autoFocus value={device} onChange={e=>setDevice(e.target.value)} placeholder="Ex.: iPhone 13 Pro" required/></label><label>Valor (R$)<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="450,00" required/></label></div><label>Serviço<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: Reparo de placa"/></label><label>Data<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>Salvar serviço</button></div></form></Modal>
}

function PaymentModal({total,onClose,onSave}:{total:number;onClose:()=>void;onSave:(amount:number,method:string,note:string)=>Promise<void>}){
  const [amount,setAmount]=useState(total.toFixed(2)); const [method,setMethod]=useState('PIX'); const [note,setNote]=useState(''); const [busy,setBusy]=useState(false); const val=Number(amount.replace(',','.'))
  return <Modal title="Registrar pagamento" onClose={onClose}><div className="payment-total"><span>Selecionado</span><b>{money(total)}</b></div><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onSave(val,method,note)}catch(err:any){alert(err.message)}finally{setBusy(false)}}}><label>Valor recebido<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} required/></label>{val<total&&val>0&&<div className="info-box">Pagamento parcial. O sistema quitará os serviços selecionados do mais antigo para o mais recente e manterá o restante em aberto.</div>}<label>Forma de pagamento<select value={method} onChange={e=>setMethod(e.target.value)}><option>PIX</option><option>Dinheiro</option><option>Transferência</option><option>Cartão</option><option>Outro</option></select></label><label>Observação<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Opcional"/></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy||val<=0||val>total}>Confirmar {val>0?money(val):''}</button></div></form></Modal>
}

function StatementModal({store,data,businessName,onClose}:{store:Store;data:DataSet;businessName:string;onClose:()=>void}){
  const [start,setStart]=useState(monthStart()); const [end,setEnd]=useState(today()); const [copied,setCopied]=useState(false)
  const services=data.services.filter(s=>s.store_id===store.id && s.service_date>=start && s.service_date<=end && serviceOutstanding(s.id,data)>0.009).sort((a,b)=>a.service_date.localeCompare(b.service_date))
  const total=services.reduce((sum,s)=>sum+serviceOutstanding(s.id,data),0)
  const text=buildStatementText(businessName,store,services,data,start,end)
  const copy=async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const whats=()=>window.open(`https://wa.me/${normalizePhone(store.phone)}?text=${encodeURIComponent(text)}`,'_blank')
  return <Modal title="Fechamento / cobrança" onClose={onClose}><div className="form-grid"><label>De<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Até<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label></div><div className="statement-preview"><div className="receipt-brand">{businessName}</div><b>{store.name}</b><span>{dateBR(start)} a {dateBR(end)}</span>{services.map(s=><div className="statement-line" key={s.id}><span>{dateBR(s.service_date)} · {s.device}<small>{s.description}</small></span><b>{money(serviceOutstanding(s.id,data))}</b></div>)}<div className="statement-total"><span>Total em aberto</span><b>{money(total)}</b></div></div><div className="share-actions"><button className="secondary" onClick={copy}><ClipboardCopy/>{copied?'Copiado':'Copiar mensagem'}</button><button className="whatsapp" disabled={!store.phone} onClick={whats}><MessageCircle/>Abrir WhatsApp</button></div></Modal>
}

function ReceiptModal({payment,data,businessName,onClose}:{payment:Payment;data:DataSet;businessName:string;onClose:()=>void}){
  const store=data.stores.find(s=>s.id===payment.store_id)!; const allocs=data.allocations.filter(a=>a.payment_id===payment.id); const rows=allocs.map(a=>({a,s:data.services.find(s=>s.id===a.service_id)})).filter(x=>x.s)
  const remaining=store?storeOpen(store.id,data):0
  const text=`${businessName}\nComprovante de pagamento\n\nCliente: ${store?.name||'-'}\nData: ${dateBR(payment.paid_at)}\n\n${rows.map(x=>`${x.s!.device} - ${x.s!.description||'Serviço'} - ${money(x.a.amount)}`).join('\n')}\n\nTotal recebido: ${money(payment.amount)}\nSaldo atual em aberto: ${money(remaining)}`
  const copy=()=>navigator.clipboard.writeText(text)
  const whats=()=>window.open(`https://wa.me/${normalizePhone(store?.phone||'')}?text=${encodeURIComponent(text)}`,'_blank')
  return <Modal title="Comprovante de pagamento" onClose={onClose}><div className="statement-preview printable"><div className="receipt-brand">{businessName}</div><b>Comprovante de pagamento</b><span>{store?.name}</span><span>{dateBR(payment.paid_at)} · {payment.method}</span>{rows.map(x=><div className="statement-line" key={x.a.id}><span>{x.s!.device}<small>{x.s!.description}</small></span><b>{money(x.a.amount)}</b></div>)}<div className="statement-total"><span>Total recebido</span><b>{money(payment.amount)}</b></div><div className="receipt-balance">Saldo atual em aberto: <b>{money(remaining)}</b></div></div><div className="share-actions"><button className="secondary" onClick={copy}><ClipboardCopy/>Copiar</button><button className="secondary" onClick={()=>window.print()}><Download/>Salvar PDF</button><button className="whatsapp" disabled={!store?.phone} onClick={whats}><MessageCircle/>WhatsApp</button></div></Modal>
}

function servicePaid(serviceId:string,data:DataSet){return data.allocations.filter(a=>a.service_id===serviceId).reduce((s,a)=>s+a.amount,0)}
function serviceOutstanding(serviceId:string,data:DataSet){const srv=data.services.find(s=>s.id===serviceId);return srv?Math.max(0,+((srv.amount-servicePaid(serviceId,data)).toFixed(2))):0}
function storeOpen(storeId:string,data:DataSet){return data.services.filter(s=>s.store_id===storeId).reduce((sum,s)=>sum+serviceOutstanding(s.id,data),0)}
function ageDays(date:string){return Math.floor((Date.now()-new Date(date+'T12:00:00').getTime())/86400000)}
function storeOld(storeId:string,data:DataSet){return data.services.filter(s=>s.store_id===storeId&&ageDays(s.service_date)>30).reduce((sum,s)=>sum+serviceOutstanding(s.id,data),0)}
function normalizePhone(p:string){let d=digits(p); if(d && !d.startsWith('55')) d='55'+d; return d}
function buildStatementText(businessName:string,store:Store,services:Service[],data:DataSet,start:string,end:string){const body=services.map(s=>`${dateBR(s.service_date)} - ${s.device}${s.description?' - '+s.description:''} - ${money(serviceOutstanding(s.id,data))}`).join('\n');const total=services.reduce((sum,s)=>sum+serviceOutstanding(s.id,data),0);return `${businessName}\n\nOlá! Segue seu fechamento:\n\n${body||'Nenhum serviço em aberto no período.'}\n\nTotal em aberto: ${money(total)}\nPeríodo: ${dateBR(start)} a ${dateBR(end)}`}
