class picker extends HTMLElement {
  #state={isOpen:false,h:0,s:100,v:100,a:1};
  #value=null; #ui={};

  constructor(){ super(); this.attachShadow({mode:'open'}); }

  connectedCallback(){
    this.#initValue();
    this.#render();
    this.#updateUI();
    document.addEventListener('click',this.#outside);
  }
  disconnectedCallback(){
    document.removeEventListener('click',this.#outside);
  }

  static get observedAttributes(){return['value'];}
  attributeChangedCallback(_,o,n){
    if(o!==n&&_==='value'){
      this.#setColor(n);
    }
  }

  #initValue(){
    const v=this.getAttribute('value');
    this.#value=CSS.supports("color",v)?v:'#ff0000';
    const {h,s,v:vv}=this.#rgbToHsv(...this.#hexToRgb(this.#value));
    Object.assign(this.#state,{h,s,v:vv});
  }

  #$(s){return this.shadowRoot.querySelector(s);}

  #render(){
    this.shadowRoot.innerHTML=`
<div id="btn"></div>

<div id="wrap">
  <div id="tabs">
    <div class="tab active" data-tab="picker">Picker</div>
    <div class="tab" data-tab="palette">Palette</div>
    <div class="tab" data-tab="image">Image</div>
  </div>

  <div id="tab-contents">
    <div class="page" data-tab="picker">
      <div id="sv" class="touch-none"><div id="sv-c"></div></div>
      <div class="sl touch-none" id="h-sl"><div class="tr h"></div><div class="th" id="h-th"></div></div>
      <div class="sl touch-none" id="a-sl"><div class="tr a"></div><div class="th" id="a-th"></div></div>

      <div id="in">
        <div class="f"><span>HEX</span><input id="hex" class="ed" type="text" spellcheck="false"></div>
        <div class="f s"><span>R</span><input id="r" class="ed" type="number" min="0" max="255"></div>
        <div class="f s"><span>G</span><input id="g" class="ed" type="number" min="0" max="255"></div>
        <div class="f s"><span>B</span><input id="b" class="ed" type="number" min="0" max="255"></div>
      </div>
    </div>

    <div class="page hidden" data-tab="palette">
      <div id="palette-grid"></div>
    </div>

    <div class="page hidden" data-tab="image">
      <input id="image-file" type="file" accept="image/*" hidden>
      <label for="image-file" id="image-span">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="up-icon"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
        <span>Click or Drop Image</span>
      </label>

      <div id="cvs-wrapper" class="hidden">
        <canvas id="cvs" class="touch-none"></canvas>
        <button id="image-reset" class="btn-sm">Change Image</button>
      </div>
    </div>
  </div>
</div>
<style>
* { user-select: none; box-sizing: border-box; }
:host {
  position: relative; display: inline-block; font-family: 'Segoe UI', system-ui, sans-serif;
  --r: 12px; --bd: 1px solid #eee; --sh: 0 12px 30px rgba(0,0,0,0.12);
  --ts: 14px; --tsh: 0 1px 4px rgba(0,0,0,0.3); --accent: #007aff;
}
#btn { width: 48px; height: 24px; border-radius: var(--r); border: 1px solid #ddd; cursor: pointer; transition: 0.2s; }
#btn:hover { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(0,122,255,0.1); }

#wrap {
  position: absolute; top: calc(100% + 10px); left: 0; display: none; width: 280px; padding: 16px;
  border-radius: var(--r); border: 1px solid #eee; background: #fff; box-shadow: var(--sh); z-index: 9999;
}

#tabs { display: flex; gap: 4px; margin-bottom: 16px; background: #f5f5f7; padding: 4px; border-radius: 10px; }
.tab { flex: 1; padding: 7px 0; text-align: center; border-radius: 7px; cursor: pointer; font-size: 11px; color: #888; transition: 0.2s; font-weight: 600; }
.tab.active { background: #fff; color: #000; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.page { width: 100%; min-height: 50px; max-height: 300px; overflow-y: auto; }
.hidden { display: none !important; }
.touch-none { touch-action: none; }

#sv { width: 100%; height: 180px; position: relative; border-radius: 8px; cursor: crosshair; background: red; margin-bottom: 16px; }
#sv::before { content: ""; position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent); }
#sv::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent); }
#sv-c { width: var(--ts); height: var(--ts); border-radius: 50%; border: 2px solid #fff; position: absolute; transform: translate(-7px, -7px); pointer-events: none; box-shadow: var(--tsh); }

.sl { position: relative; height: 10px; margin-bottom: 16px; cursor: pointer; }
.tr { position: absolute; inset: 0; border-radius: 5px; }
.tr.h { background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
.tr.a { background: linear-gradient(to right, transparent, #000); }
.th { width: 16px; height: 16px; border-radius: 50%; background: #fff; border: 1px solid #ddd; position: absolute; top: 50%; transform: translate(-8px, -50%); cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); pointer-events: none; }

#in { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 8px; }
.f { display: flex; flex-direction: column; font-size: 9px; color: #bbb; font-weight: 800; letter-spacing: 0.05em; }
.ed { border: 1px solid #eee; border-radius: 6px; padding: 6px 2px; background: #f9f9f9; font-size: 11px; outline: none; text-align: center; font-family: 'SF Mono', monospace; transition: 0.2s; }
.ed:focus { border-color: var(--accent); background: #fff; }

#palette-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.palette-item { aspect-ratio: 1; border-radius: 6px; cursor: pointer; border: 1px solid rgba(0,0,0,0.05); transition: 0.2s; }
.palette-item:hover { transform: scale(1.15); z-index: 1; }

#image-span {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 100%; height: 180px; border: 2px dashed #e0e0e0; border-radius: var(--r);
  color: #aaa; cursor: pointer; transition: all 0.3s; gap: 12px;
}
#image-span:hover, #image-span.dragover { border-color: var(--accent); background: rgba(0,122,255,0.02); color: var(--accent); }
#image-span:hover .up-icon { transform: translateY(-4px); }
.up-icon { transition: transform 0.3s; }

#cvs-wrapper { width: 100%; animation: zoomIn 0.3s; }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
#cvs { width: 100%; border-radius: 8px; cursor: crosshair; border: 1px solid #eee; }

.btn-sm {
  width: 100%; margin-top: 12px; padding: 8px; border-radius: 8px; border: none;
  background: #f0f0f4; color: #555; cursor: pointer; font-size: 11px; font-weight: 600; transition: 0.2s;
}
.btn-sm:hover { background: #e5e5ea; color: #000; }
</style>
    `;

    this.#initRefs();
    this.#initEvents();
  }

  #initRefs(){
    const $ = s => this.shadowRoot.querySelector(s);
    this.#ui = {
      btn: $('#btn'), wrap: $('#wrap'), 
      tabs: [...this.shadowRoot.querySelectorAll('.tab')],
      pages: {},
      sv: $('#sv'), svC: $('#sv-c'),
      hSl: $('#h-sl'), hTh: $('#h-th'),
      aSl: $('#a-sl'), aTh: $('#a-th'),
      hex: $('#hex'), r: $('#r'), g: $('#g'), b: $('#b'),
      cvs: $('#cvs'), ctx: $('#cvs').getContext('2d', {willReadFrequently: true}),
      imageSpan: $('#image-span'), cvsWrapper: $('#cvs-wrapper'),
      imageFile: $('#image-file'), imageReset: $('#image-reset'),
      paletteGrid: $('#palette-grid')
    };
    [...this.shadowRoot.querySelectorAll('.page')].forEach(p => { this.#ui.pages[p.dataset.tab] = p; });

    const colors = ['#000000','#FFFFFF','#FF3B30','#FF9500','#FFCC00','#4CD964','#5AC8FA','#007AFF','#5856D6','#FF2D55','#8E8E93'];
    colors.forEach(c => {
      const item = document.createElement('div');
      item.className = 'palette-item';
      item.style.background = c;
      item.onclick = () => this.#setColor(c);
      this.#ui.paletteGrid.appendChild(item);
    });
  }

  #initEvents(){
    this.#ui.btn.onclick = (e) => { e.stopPropagation(); this.#state.isOpen ? this.#close() : this.#open(); };
    this.#ui.tabs.forEach(t => t.onclick = (e) => this.#switchTab(e.target.dataset.tab));
    
    // Pointer Events（クリック中のみ動くように強化）
    this.#ui.sv.onpointerdown = (e) => this.#dragStart(e, (ev) => this.#svMove(ev));
    this.#ui.hSl.onpointerdown = (e) => this.#dragStart(e, (ev) => this.#hMove(ev));
    this.#ui.aSl.onpointerdown = (e) => this.#dragStart(e, (ev) => this.#aMove(ev));
    
    this.#ui.hex.oninput = () => this.#hexIn();
    this.#ui.r.oninput = () => this.#rgbIn();
    this.#ui.g.oninput = () => this.#rgbIn();
    this.#ui.b.oninput = () => this.#rgbIn();

    this.#ui.imageSpan.ondragover = (e) => { e.preventDefault(); this.#ui.imageSpan.classList.add('dragover'); };
    this.#ui.imageSpan.ondragleave = () => this.#ui.imageSpan.classList.remove('dragover');
    this.#ui.imageSpan.ondrop = (e) => {
      e.preventDefault();
      this.#ui.imageSpan.classList.remove('dragover');
      if (e.dataTransfer.files[0]) this.#processFile(e.dataTransfer.files[0]);
    };
    this.#ui.imageFile.onchange = (e) => { if (e.target.files[0]) this.#processFile(e.target.files[0]); };
    this.#ui.imageReset.onclick = () => {
      this.#ui.cvsWrapper.classList.add('hidden');
      this.#ui.imageSpan.classList.remove('hidden');
      this.#ui.imageFile.value = '';
    };
    this.#ui.cvs.onpointerdown = (e) => this.#pickColor(e);
  }

  // ドラッグ開始ロジック： pointermove を down 内で一時的に購読
  #dragStart(e, moveFn) {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      if (ev.pointerId === e.pointerId) moveFn(ev);
    };
    const onUp = (ev) => {
      if (ev.pointerId === e.pointerId) {
        target.releasePointerCapture(ev.pointerId);
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onUp);
      }
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
    
    moveFn(e); // 最初の一回
  }

  #switchTab(tab){
    this.#ui.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    Object.values(this.#ui.pages).forEach(p => p.classList.toggle("hidden", p.dataset.tab !== tab));
  }

  #processFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 248;
        this.#ui.cvs.width = maxW;
        this.#ui.cvs.height = img.height * (maxW / img.width);
        this.#ui.ctx.drawImage(img, 0, 0, this.#ui.cvs.width, this.#ui.cvs.height);
        this.#ui.imageSpan.classList.add('hidden');
        this.#ui.cvsWrapper.classList.remove('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  #pickColor(e) {
    const r = this.#ui.cvs.getBoundingClientRect();
    const x = (e.clientX - r.left) * (this.#ui.cvs.width / r.width);
    const y = (e.clientY - r.top) * (this.#ui.cvs.height / r.height);
    const data = this.#ui.ctx.getImageData(x, y, 1, 1).data;
    this.#setColor(this.#rgbToHex(data[0], data[1], data[2]));
  }

  #setColor(hex) {
    if (!CSS.supports('color', hex)) return;
    const [r, g, b] = this.#hexToRgb(hex);
    const { h, s, v } = this.#rgbToHsv(r, g, b);
    Object.assign(this.#state, { h, s, v });
    this.#updateUI();
    this.#emit();
  }

  #outside = (e) => { if(!this.contains(e.target)) this.#close(); };
  #open(){ this.#state.isOpen=true; this.#ui.wrap.style.display='block'; }
  #close(){ this.#state.isOpen=false; this.#ui.wrap.style.display='none'; }

  #svMove(e){
    const r=this.#ui.sv.getBoundingClientRect();
    this.#state.s=Math.min(Math.max(0,(e.clientX-r.left)/r.width*100),100);
    this.#state.v=Math.min(Math.max(0,100-(e.clientY-r.top)/r.height*100),100);
    this.#updateUI(); this.#emit();
  }
  #hMove(e){
    const r=this.#ui.hSl.getBoundingClientRect();
    this.#state.h=Math.min(Math.max(0,(e.clientX-r.left)/r.width*360),360);
    this.#updateUI(); this.#emit();
  }
  #aMove(e){
    const r=this.#ui.aSl.getBoundingClientRect();
    this.#state.a=Math.min(Math.max(0,(e.clientX-r.left)/r.width),1);
    this.#updateUI(); this.#emit();
  }

  #hexIn(){
    const t=this.#ui.hex.value.trim();
    if(!/^#?[0-9a-fA-F]{6}$/.test(t))return;
    this.#setColor(t.startsWith("#")?t:"#"+t);
  }
  #rgbIn(){
    const r=+this.#ui.r.value, g=+this.#ui.g.value, b=+this.#ui.b.value;
    if([r,g,b].some(n=>isNaN(n)||n<0||n>255))return;
    this.#setColor(this.#rgbToHex(r,g,b));
  }

  #updateUI(){
    const {h,s,v,a}=this.#state;
    const hex=this.#hsvToHex(h,s,v);
    this.#value=hex;
    const [r,g,b]=this.#hexToRgb(hex);
    this.#ui.btn.style.background=`rgba(${r},${g},${b},${a})`;
    this.#ui.sv.style.background=`hsl(${h},100%,50%)`;
    this.#ui.svC.style.left=`${s}%`;
    this.#ui.svC.style.top=`${100-v}%`;
    this.#ui.hTh.style.left=`${(h/360)*100}%`;
    this.#ui.aTh.style.left=`${a*100}%`;
    if(this.shadowRoot.activeElement !== this.#ui.hex) this.#ui.hex.value=hex;
    if(this.shadowRoot.activeElement !== this.#ui.r) this.#ui.r.value=r;
    if(this.shadowRoot.activeElement !== this.#ui.g) this.#ui.g.value=g;
    if(this.shadowRoot.activeElement !== this.#ui.b) this.#ui.b.value=b;
  }

  #emit(){
    this.setAttribute("value",this.#value);
    this.dispatchEvent(new CustomEvent("change",{detail:{value:this.#value}}));
  }

  #hexToRgb(h){const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
  #rgbToHex(r,g,b){const h=n=>n.toString(16).padStart(2,'0');return`#${h(r)}${h(g)}${h(b)}`}
  #rgbToHsv(r,g,b){
    r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
    let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4}
    h=Math.round(h*60);if(h<0)h+=360;return{h,s:(mx?d/mx:0)*100,v:mx*100}
  }
  #hsvToHex(h,s,v){
    s/=100;v/=100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
    let [r,g,b]=[0,0,0];if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];
    else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else [r,g,b]=[c,0,x];
    return this.#rgbToHex(Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255))
  }
}
customElements.define('color-pic', picker);
