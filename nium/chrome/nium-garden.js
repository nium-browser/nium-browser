/* Nium: a areia com ondas do site do Nium, desenhada ao vivo (mesma receita do site). MPL-2.0
 *
 * NiumGarden.mount(host, { lens, center: [x, y] }) põe um <canvas class="nium-sand"> no começo de `host` e desenha
 * as ondas se movendo, como em niumbrowser.web.app. Sob a lente (opcional) a areia fica mais suave,
 * como vidro fosco. Se o computador não aguentar (ou o movimento estiver reduzido no sistema), não
 * desenha nada e fica a imagem parada que o CSS já mostra. Usado na nova aba e nas boas-vindas.
 */
"use strict";

var NiumGarden = (() => {
  const VS = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const FS = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uScale,uT,uLens;
uniform vec3 uBase,uEdge,uLight,uDark;
uniform float uGain,uGlow;
uniform vec2 uCenter;
out vec4 o;
const vec2 SIZE=vec2(2560.,1600.);
const float S=31.,PERIOD=8.;
float field(vec2 u){
  float t=uT;
  vec2 w=vec2(
    sin(u.x*.0021+u.y*.0013+t*.09)+.7*sin(u.x*.0043-u.y*.0031-t*.06),
    sin(u.x*.0017-u.y*.0024-t*.07)+.7*sin(u.x*.0036+u.y*.0047+t*.05))*11.;
  return length(u+w-SIZE*.5);
}
float prof(float d){float c=cos(3.14159265*d/S-uT*3.14159265/PERIOD);return pow(c*c+.0025,.35)*S*.42;}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 u=(px-uRes*uCenter)/uScale+SIZE*.5;
  float d=field(u);
  vec2 grad=vec2(dFdx(d),-dFdy(d))*uScale;
  float slope=(prof(d+.6)-prof(d-.6))/1.2;
  float sh=clamp(dot(grad*slope,vec2(-.62,-.72)),-1.3,1.3);
  vec2 rv=(u-SIZE*.5)/SIZE*vec2(1.,.8);
  float r=length(rv);
  float t=pow(clamp(r/.62,0.,1.),1.5);
  vec3 c=mix(uBase,uEdge,t);
  float fade=.35+.65*exp(-(r/.52)*(r/.52));
  float swell=1.+.32*sin(d*.0065-uT*.38);
  float inLens=uLens>0.?smoothstep(uLens-2.,uLens+2.,length(u-SIZE*.5)):1.;
  float s=sh*fade*uGain*swell*mix(.34,1.,inLens);
  c+=(uLight-c)*max(s,0.)*.55;
  c+=(uDark-c)*max(-s,0.)*.55;
  c*=1.+uGlow*exp(-(r/.34)*(r/.34));
  c+=(hash(px)-.5)*.0125;
  o=vec4(c,1.);
}`;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const THEMES = {
    light: { uBase: hex("#e9ede4"), uEdge: hex("#d6dfd6"), uLight: hex("#fffffa"), uDark: hex("#96aca0"), uGain: 0.62, uGlow: 0.03 },
    dark: { uBase: hex("#1a282c"), uEdge: hex("#0f181c"), uLight: hex("#547476"), uDark: hex("#04090c"), uGain: 0.7, uGlow: 0.28 },
  };

  function mount(host, opts = {}) {
    const win = host.ownerGlobal || window;
    const doc = host.ownerDocument;
    const motion = win.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return null;
    const darkQuery = win.matchMedia("(prefers-color-scheme: dark)");
    const canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    canvas.className = "nium-sand";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: true });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    host.prepend(canvas);

    let lens = opts.lens || null;
    const size = () => {
      const q = Math.min(win.devicePixelRatio || 1, 1.5);
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * q);
      canvas.height = Math.round(h * q);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const s = Math.max(w / 2560, h / 1600);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform1f(U("uScale"), s * q);
      // O centro das ondas fica no meio da lente (ou no meio da tela, sem lente).
      let cx = opts.center?.[0] ?? 0.5;
      let cy = opts.center?.[1] ?? 0.5;
      let r = 0;
      if (lens && lens.isConnected && lens.offsetWidth) {
        const hb = host.getBoundingClientRect();
        const lb = lens.getBoundingClientRect();
        cx = (lb.left + lb.width / 2 - hb.left) / w;
        cy = (lb.top + lb.height / 2 - hb.top) / h;
        r = lb.width / 2 / s;
      }
      gl.uniform2f(U("uCenter"), cx, cy);
      gl.uniform1f(U("uLens"), r);
    };
    size();
    // As cores passam de um tema para o outro devagar, sem pular.
    const now = structuredClone(THEMES[darkQuery.matches ? "dark" : "light"]);
    const theme = () => {
      const T = THEMES[darkQuery.matches ? "dark" : "light"];
      for (const k in T) {
        if (Array.isArray(T[k])) {
          now[k] = now[k].map((v, i) => v + (T[k][i] - v) * 0.14);
          gl.uniform3fv(U(k), now[k]);
        } else {
          now[k] += (T[k] - now[k]) * 0.14;
          gl.uniform1f(U(k), now[k]);
        }
      }
    };
    let running = true;
    const started = win.performance.now();
    let prev = 0;
    let seen = 0;
    let slow = 0;
    let last = 0;
    const STEP = 1000 / 31;
    const stop = () => {
      running = false;
      canvas.remove();
      host.classList.remove("nium-live");
      doc.documentElement.classList.remove("nium-live");
      win.removeEventListener("resize", onResize);
    };
    const tick = t => {
      if (!running) return;
      win.requestAnimationFrame(tick);
      if (t - prev < STEP || doc.hidden) return;
      const gap = t - prev;
      prev = t;
      theme();
      gl.uniform1f(U("uT"), (t - started) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Se não segurar uns 20 quadros por segundo no começo, para e fica a imagem parada.
      if (last && seen < 90) {
        seen++;
        if (gap > 50) slow++;
        if (seen >= 30 && slow / seen > 0.5) stop();
      }
      last = t;
    };
    let timer;
    const onResize = () => {
      win.clearTimeout(timer);
      timer = win.setTimeout(size, 120);
    };
    win.addEventListener("resize", onResize);
    canvas.addEventListener("webglcontextlost", stop);
    host.classList.add("nium-live");
    doc.documentElement.classList.add("nium-live");
    win.requestAnimationFrame(tick);
    return {
      stop,
      resize: size,
      setLens(el) {
        lens = el;
        size();
      },
    };
  }

  return { mount };
})();
