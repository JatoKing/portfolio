import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontData from "three/examples/fonts/helvetiker_bold.typeface.json";

const FILM_WIDTH = 1280, FILM_HEIGHT = 720;
const WATERLINE = 620;

/** Transparent 3D composite aligned to the source film, which remains a native video. */
export function createWaterfallScene(host: HTMLDivElement, video: HTMLVideoElement) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power", premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1280/90,1280/90,WATERLINE/45,-(720-WATERLINE)/45,.1,100);
  camera.position.set(7, 4, 30); camera.lookAt(0,0,0); camera.updateMatrixWorld();
  scene.add(new THREE.HemisphereLight(0xd5efff,0x2b7c85,2.0));
  const sun = new THREE.DirectionalLight(0xffecd0,3.2); sun.position.set(-7,12,10); scene.add(sun);
  sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera, { left:-7,right:7,top:7,bottom:-5,near:.1,far:45 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .016; sun.shadow.radius = 3;
  const fill = new THREE.DirectionalLight(0x71cddd,.8); fill.position.set(5,1,8); scene.add(fill);
  const monument = new THREE.Group(); scene.add(monument);
  const clock = { value: 0 };
  const stone = new THREE.MeshStandardMaterial({ color: 0xc9c7b9, roughness: .94, metalness: 0 });
  const sides = new THREE.MeshStandardMaterial({ color: 0x85969a, roughness: .92, metalness: 0 });
  materials.add(stone); materials.add(sides);
  // World-space pores and a damp, cool base are stable; only the waterline moves.
  for (const material of [stone,sides]) {
    material.onBeforeCompile = shader => {
      shader.uniforms.riverTime = clock;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vStonePosition;');
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvStonePosition = (modelMatrix * vec4(position,1.)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vStonePosition; uniform float riverTime;
        float grain(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float pore = grain(floor(vStonePosition*110.));
        float weather = sin(vStonePosition.x*8.+vStonePosition.y*13.)*sin(vStonePosition.z*11.-vStonePosition.y*7.);
        diffuseColor.rgb *= .965 + pore*.035 + weather*.012;
        float damp = 1. - smoothstep(.02,.48,vStonePosition.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.58,.74,.78), damp*.58);
        if(vStonePosition.y < .018 + sin(vStonePosition.x*7. + riverTime*2.)*.007) discard;`);
    };
  }
  const font = new FontLoader().parse(fontData);
  function text(value: string, size: number, depth: number, y: number, z: number) {
    const geometry = new TextGeometry(value,{font,size,depth,curveSegments:20,bevelEnabled:true,bevelSize:.048,bevelThickness:.042,bevelSegments:5});
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    const object = new THREE.Mesh(geometry,[stone,sides]);
    object.position.set(-(bounds.max.x+bounds.min.x)/2,y,z);
    object.castShadow = object.receiveShadow = true;
    monument.add(object); geometries.add(geometry); return object;
  }
  text("404",3.05,1.05,.035,0);
  text("ERROR",.72,.46,3.12,-.16);
  const lintelGeometry = new THREE.BoxGeometry(3.8,.085,.48); geometries.add(lintelGeometry);
  const lintel = new THREE.Mesh(lintelGeometry,stone); lintel.position.set(0,3.08,.08); lintel.castShadow = lintel.receiveShadow = true; monument.add(lintel);

  // A transparent shadow catcher grounds the feet without painting over the film.
  const shadowMaterial = new THREE.ShadowMaterial({color:0x143e46,opacity:.25}); materials.add(shadowMaterial);
  const shadowGeometry = new THREE.PlaneGeometry(10,3); geometries.add(shadowGeometry);
  const contact = new THREE.Mesh(shadowGeometry,shadowMaterial); contact.rotation.x = -Math.PI/2; contact.position.set(0,.014,.35); contact.receiveShadow = true; monument.add(contact);

  const target = new THREE.WebGLRenderTarget(FILM_WIDTH,FILM_HEIGHT,{type:THREE.HalfFloatType,samples:4});
  const compositeScene = new THREE.Scene();
  const compositeCamera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const riverFrame = new THREE.VideoTexture(video); riverFrame.colorSpace = THREE.SRGBColorSpace;
  const composite = new THREE.ShaderMaterial({
    transparent:true, depthTest:false, depthWrite:false,
    uniforms:{ lettering:{value:target.texture}, river:{value:riverFrame}, time:clock, resolution:{value:new THREE.Vector2(FILM_WIDTH,FILM_HEIGHT)}, waterline:{value:1-WATERLINE/FILM_HEIGHT}, span:{value:.31}, },
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`
      uniform sampler2D lettering, river; uniform float time, waterline, span; uniform vec2 resolution; varying vec2 vUv;
      void main(){
        vec4 solid=texture2D(lettering,vUv);
        float foam=smoothstep(.38,.78,dot(texture2D(river,vUv).rgb,vec3(.2126,.7152,.0722)));
        float edge=1.-smoothstep(.002,.012,abs(vUv.y-waterline));
        solid.a*=1.-foam*edge*.72;
        vec4 reflection=vec4(0.);
        float below=waterline-vUv.y;
        if(below>0.){
          float travel=below/.72;
          float wave=sin(below*340.-time*2.1)*.0011+sin(below*137.+time*1.3)*.0015;
          wave*=smoothstep(0.,.025,below);
          vec2 reflected=vec2(.5+(vUv.x-.5)/(1.+below*.2)+wave,waterline+travel);
          vec2 texel=1./resolution;
          vec4 blur=texture2D(lettering,reflected)*.28;
          blur+=texture2D(lettering,reflected+vec2(texel.x*1.5,0.))*.18;
          blur+=texture2D(lettering,reflected-vec2(texel.x*1.5,0.))*.18;
          blur+=texture2D(lettering,reflected+vec2(0.,texel.y*1.2))*.18;
          blur+=texture2D(lettering,reflected-vec2(0.,texel.y*1.2))*.18;
          float bankMask=1.-smoothstep(span*.40,span*.58,abs(vUv.x-.5));
          float fade=exp(-below*9.)*(1.-smoothstep(.10,.145,below));
          float ripples=.82+.18*sin(vUv.y*620.+time*2.8+sin(vUv.x*45.));
          reflection=vec4(blur.rgb*vec3(.65,.84,.86),blur.a*fade*bankMask*ripples*(1.-foam*.6)*.62);
        }
        float a=solid.a+reflection.a*(1.-solid.a);
        vec3 rgb=(solid.rgb*solid.a+reflection.rgb*reflection.a*(1.-solid.a))/max(a,.00001);
        gl_FragColor=vec4(rgb,a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }); materials.add(composite);
  const quadGeometry = new THREE.PlaneGeometry(2,2); geometries.add(quadGeometry);
  compositeScene.add(new THREE.Mesh(quadGeometry,composite));
  let paused=false, disposed=false, contextLost=false, raf=0;
  const render=()=>{
    clock.value=video.currentTime;
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene,camera);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(compositeScene,compositeCamera);
  };
  const tick=()=>{raf=0;if(disposed||paused||contextLost||document.hidden||video.paused)return;render();raf=requestAnimationFrame(tick);};
  const resume=()=>{if(raf)cancelAnimationFrame(raf);raf=0;if(!disposed&&!paused&&!contextLost&&!document.hidden&&!video.paused)raf=requestAnimationFrame(tick);};
  const resize=()=>{
    const width=host.clientWidth,height=host.clientHeight;
    const cover=Math.max(width/FILM_WIDTH,height/FILM_HEIGHT);
    const visibleFilmWidth=width/cover;
    // Match the video's cover crop exactly; scale only the lettering for narrow screens.
    const scale=Math.min(1,visibleFilmWidth*.84/335);
    monument.scale.setScalar(scale);
    composite.uniforms.span.value=.31*scale;
    const ratio=Math.min(1.8,Math.max(1,cover*window.devicePixelRatio));
    renderer.setPixelRatio(ratio);renderer.setSize(FILM_WIDTH,FILM_HEIGHT,false);
    target.setSize(Math.round(FILM_WIDTH*ratio),Math.round(FILM_HEIGHT*ratio));
    composite.uniforms.resolution.value.set(FILM_WIDTH*ratio,FILM_HEIGHT*ratio);
    if(!contextLost)render();
  };
  const onSeek=()=>{if(!disposed&&!contextLost)render();}; video.addEventListener('seeked',onSeek);
  video.addEventListener('play',resume);video.addEventListener('pause',resume);
  const onLost=(event:Event)=>{event.preventDefault();contextLost=true;resume();host.parentElement?.classList.remove('is-ready');};
  const onRestored=()=>{contextLost=false;resize();host.parentElement?.classList.add('is-ready');resume();};
  renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
  const observer=new ResizeObserver(resize);observer.observe(host);resize();resume();
  return {
    setPaused(value:boolean){paused=value;if(!contextLost)render();resume();},
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();video.removeEventListener('seeked',onSeek);video.removeEventListener('play',resume);video.removeEventListener('pause',resume);renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());riverFrame.dispose();target.dispose();sun.shadow.dispose();renderer.dispose();renderer.domElement.remove();},
  };
}
