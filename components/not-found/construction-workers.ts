import * as THREE from "three";

type Point = [number, number, number];
type Task = "plank-walk" | "table-plans" | "panel-fastening" | "scaffold-bracing" | "survey-scope" | "structure-inspection" | "table-marking" | "overhead-fit" | "tape-measure" | "site-walk" | "frame-square" | "scaffold-check" | "panel-guidance" | "board-placement" | "clipboard-review" | "ground-measure";
type Profile = {
  name: string; at: Point; heading: number; task: Task;
  height: number; build: number; stance: number; stagger: number;
  vest: number; shirt: number; pants: number; hat: number; skin: number;
  detail: "pockets" | "open-vest" | "belt" | "overalls";
  phase: number; cycles: number; work: number; lean: number;
};

// Authored individuals: no random regeneration, shared poses, or cloned character meshes.
const crew: Profile[] = [
  { name: "plank-carrier", at: [-1.9,.34,1.45], heading: Math.PI/2, task: "plank-walk", height: 1.03, build: .96, stance: .053, stagger: .01, vest: 0xb47b56, shirt: 0x829398, pants: 0x617982, hat: 0xc8ab74, skin: 0xb98e70, detail: "open-vest", phase: .03, cycles: 1, work: .75, lean: .025 },
  { name: "site-planner", at: [-3,.34,3.45], heading: Math.PI, task: "table-plans", height: .95, build: .86, stance: .045, stagger: .045, vest: 0xc19b73, shirt: 0xe0dfd6, pants: 0x82929b, hat: 0xe2d7b9, skin: 0x8c664f, detail: "pockets", phase: .27, cycles: 1, work: .67, lean: .18 },
  { name: "panel-fitter", at: [4.05,2.21,.08], heading: -Math.PI/2, task: "panel-fastening", height: .98, build: 1.06, stance: .067, stagger: -.035, vest: 0xad7655, shirt: 0xaeb9b9, pants: 0x6e818e, hat: 0xc39563, skin: 0xc8a68b, detail: "belt", phase: .61, cycles: 2, work: .62, lean: .06 },
  { name: "brace-technician", at: [-3.7,2.47,-1.23], heading: Math.PI/2, task: "scaffold-bracing", height: 1.07, build: .88, stance: .07, stagger: .065, vest: 0xb18b65, shirt: 0x718992, pants: 0x84959b, hat: 0xd5c59c, skin: 0xa17c61, detail: "overalls", phase: .45, cycles: 1, work: .8, lean: .13 },
  { name: "surveyor", at: [5.6,.34,-1.23], heading: Math.PI, task: "survey-scope", height: 1.0, build: 1.12, stance: .062, stagger: -.055, vest: 0xc0946c, shirt: 0xd2d5d0, pants: 0x72838b, hat: 0xd3b87b, skin: 0x87614c, detail: "pockets", phase: .79, cycles: 1, work: .46, lean: .08 },
  { name: "structure-inspector", at: [.45,.34,-2.9], heading: -.7, task: "structure-inspection", height: 1.1, build: .92, stance: .046, stagger: .03, vest: 0xb08262, shirt: 0x9aa9ae, pants: 0x687e89, hat: 0xe2ddd0, skin: 0xc3a08a, detail: "open-vest", phase: .16, cycles: 1, work: .53, lean: -.025 },
  { name: "bench-carpenter", at: [-6.1,.34,5.3], heading: Math.PI, task: "table-marking", height: .96, build: 1.14, stance: .075, stagger: .01, vest: 0xb98960, shirt: 0xc6c5b8, pants: 0x7c8f96, hat: 0xbea06e, skin: 0xa8795e, detail: "belt", phase: .36, cycles: 2, work: .72, lean: .23 },
  { name: "upper-frame-fitter", at: [7.35,2.15,-3.35], heading: Math.PI, task: "overhead-fit", height: 1.02, build: .84, stance: .05, stagger: -.07, vest: 0xc39a77, shirt: 0x798f97, pants: 0x97a4a8, hat: 0xd4c9a9, skin: 0x74523f, detail: "overalls", phase: .88, cycles: 1, work: .58, lean: -.035 },
  { name: "dimension-checker", at: [-3.2,.34,-8.3], heading: Math.PI, task: "tape-measure", height: .93, build: 1.02, stance: .07, stagger: .035, vest: 0xba855f, shirt: 0xb5bfbe, pants: 0x738691, hat: 0xd2ad70, skin: 0xc6a087, detail: "open-vest", phase: .54, cycles: 1, work: .76, lean: .09 },
  { name: "site-runner", at: [4.3,.34,9.1], heading: Math.PI/2, task: "site-walk", height: 1.08, build: .82, stance: .047, stagger: -.015, vest: 0xa97c5e, shirt: 0xd3d8d5, pants: 0x7a8f98, hat: 0xdfc28b, skin: 0x906c54, detail: "pockets", phase: .68, cycles: 1, work: .88, lean: .035 },
  { name: "frame-setter", at: [-6.15,.34,-5.15], heading: Math.PI, task: "frame-square", height: .99, build: 1.08, stance: .078, stagger: .05, vest: 0xc09870, shirt: 0x96a6a9, pants: 0x647b84, hat: 0xc0b28c, skin: 0xb58c72, detail: "belt", phase: .12, cycles: 2, work: .4, lean: .17 },
  { name: "scaffold-checker", at: [-7.1,1.90,1.25], heading: -Math.PI/2, task: "scaffold-check", height: 1.05, build: 1.0, stance: .058, stagger: -.045, vest: 0xad805c, shirt: 0xc8d0d1, pants: 0x8d999e, hat: 0xd8b782, skin: 0x7b5845, detail: "open-vest", phase: .73, cycles: 1, work: .64, lean: .07 },
  { name: "panel-guide", at: [6.65,.34,.95], heading: Math.PI, task: "panel-guidance", height: 1.04, build: 1.16, stance: .082, stagger: .015, vest: 0xbe8f66, shirt: 0x82959b, pants: 0x6d808b, hat: 0xcba978, skin: 0xc09c83, detail: "overalls", phase: .42, cycles: 1, work: .9, lean: .02 },
  { name: "board-setter", at: [7.6,.34,3.8], heading: 0, task: "board-placement", height: 1.01, build: .94, stance: .068, stagger: -.06, vest: 0xba9275, shirt: 0xc9c9bc, pants: 0x84979b, hat: 0xded3ad, skin: 0x9e7155, detail: "belt", phase: .2, cycles: 1, work: .7, lean: .12 },
  { name: "drawing-reviewer", at: [-5.35,.34,-4.8], heading: Math.PI, task: "clipboard-review", height: .92, build: .9, stance: .044, stagger: .055, vest: 0xab8461, shirt: 0x9eafb3, pants: 0x788994, hat: 0xc6b88e, skin: 0xd0af95, detail: "pockets", phase: .92, cycles: 1, work: .36, lean: .055 },
  { name: "footing-checker", at: [2.7,.34,-5.55], heading: Math.PI, task: "ground-measure", height: .97, build: 1.18, stance: .085, stagger: -.08, vest: 0xc19471, shirt: 0xd4d8d4, pants: 0x6f8490, hat: 0xc6a16a, skin: 0x815a44, detail: "overalls", phase: .05, cycles: 1, work: .82, lean: .32 },
];

const TAU = Math.PI * 2;
const smooth = (t: number) => { const u = THREE.MathUtils.clamp(t, 0, 1); return u*u*u*(u*(u*6-15)+10); };
const bump = (t: number, start: number, end: number) => t < start || t > end ? 0 : Math.sin(Math.PI * (t-start)/(end-start)) ** 2;

export function createConstructionWorkers() {
  const group = new THREE.Group(); group.name = "construction-crew";
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  const updates: ((phase: number) => void)[] = [];
  const mat = (color: number) => { const m = new THREE.MeshStandardMaterial({ color, roughness: .9 }); materials.add(m); return m; };
  function mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, p: Point = [0,0,0]) {
    geometries.add(g); const obj = new THREE.Mesh(g,m); obj.position.set(...p); obj.castShadow = obj.receiveShadow = true; parent.add(obj); return obj;
  }
  function box(w: number,h: number,d: number,m: THREE.Material,parent: THREE.Object3D,p: Point) { return mesh(new THREE.BoxGeometry(w,h,d),m,parent,p); }
  function bone(length: number, radius: number, material: THREE.Material, parent: THREE.Object3D) {
    return mesh(new THREE.CapsuleGeometry(radius, Math.max(.01,length-radius*2), 3, 8), material, parent);
  }
  const up = new THREE.Vector3(0,1,0);
  function placeBone(obj: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
    obj.position.copy(a).add(b).multiplyScalar(.5);
    obj.quaternion.setFromUnitVectors(up,b.clone().sub(a).normalize());
  }
  // Fixed bone lengths and articulated elbows/knees keep hands on their props.
  function solveLimb(a: THREE.Vector3, target: THREE.Vector3, bend: THREE.Vector3, l1: number, l2: number, upper: THREE.Mesh, lower: THREE.Mesh) {
    const axis = target.clone().sub(a), distance = THREE.MathUtils.clamp(axis.length(), .012, l1+l2-.0001); axis.normalize();
    const along = (l1*l1-l2*l2+distance*distance)/(2*distance);
    const perpendicular = bend.clone().addScaledVector(axis,-bend.dot(axis)).normalize();
    const elbow = a.clone().addScaledVector(axis,along).addScaledVector(perpendicular,Math.sqrt(Math.max(0,l1*l1-along*along)));
    const end = a.clone().addScaledVector(axis,distance);
    placeBone(upper,a,elbow); placeBone(lower,elbow,end); return end;
  }

  crew.forEach((profile, index) => {
    const person = new THREE.Group(); person.name = profile.name; person.userData.task = profile.task; person.position.set(...profile.at); person.rotation.y = profile.heading;
    person.scale.set(profile.build,profile.height,1); group.add(person);
    const shirt = mat(profile.shirt), vest = mat(profile.vest), pants = mat(profile.pants), hat = mat(profile.hat), skin = mat(profile.skin);
    const trim = mat(0xd9d6bd), boot = mat(0x657176), tool = mat(0x73858b), paper = mat(0xeaf0ef), wood = mat(0xd5c2a4);
    const body = new THREE.Group(); body.position.y = .32; person.add(body);
    mesh(new THREE.CapsuleGeometry(.078 + (profile.build-1)*.015,.14,4,10),shirt,body,[0,.115,0]);
    if (profile.detail === "open-vest") {
      for (const side of [-1,1]) box(.067,.19,.035,vest,body,[side*.048,.13,.067]);
      box(.15,.18,.025,vest,body,[0,.13,-.065]);
    } else {
      mesh(new THREE.CapsuleGeometry(.082,.095,4,10),vest,body,[0,.11,0]);
    }
    box(.158,.014,.151,trim,body,[0,.095,0]);
    for (const side of [-1,1]) {
      box(.012,.145,.009,trim,body,[side*(index%2 ? .046 : .058),.15,.087]);
      if (profile.detail === "pockets") box(.043,.044,.014,shirt,body,[side*.047,.155,.094]);
      if (profile.detail === "overalls") box(.018,.2,.015,pants,body,[side*.043,.095,.092]);
    }
    if (profile.detail === "belt") {
      box(.16,.025,.14,boot,body,[0,.015,0]);
      box(.044,.065,.04,wood,body,[(index%2 ? -1 : 1)*.102,-.003,.025]);
    }
    const head = new THREE.Group(); head.position.set(0,.32,0); body.add(head);
    const skull = mesh(new THREE.SphereGeometry(.062,12,10),skin,head); skull.scale.set(.93+(index%3)*.04,1.03+(index%4)*.025,.95);
    mesh(new THREE.SphereGeometry(.016,8,6),skin,head,[0,-.005,.058]);
    const dome = mesh(new THREE.SphereGeometry(.079,14,8,0,TAU,0,Math.PI/2),hat,head,[0,.03,0]); dome.scale.y = .85+(index%5)*.06;
    mesh(new THREE.CylinderGeometry(.089+(index%3)*.003,.089,.013,14),hat,head,[0,.032,.008]);
    box(.012,.024,.10,hat,head,[0,.088,-.004]);
    if (index%3 === 1) box(.084,.017,.018,tool,head,[0,.012,.057]);

    const arms = [-1,1].map(side => {
      const upper = bone(.135,.026,shirt,body), lower = bone(.13,.020,skin,body);
      const hand = mesh(new THREE.SphereGeometry(.025,8,6),skin,body);
      hand.name = side === -1 ? "left-hand" : "right-hand";
      return { side, upper, lower, hand };
    });
    const legs = [-1,1].map(side => {
      const upper = bone(.143,.033,pants,person), lower = bone(.148,.028,pants,person);
      const foot = box(.067,.046,.112,boot,person,[side*profile.stance,.024,side*profile.stagger]);
      foot.name = side === -1 ? "left-boot" : "right-boot";
      return { side, upper, lower, foot };
    });
    const held = new THREE.Group(); held.name = "held-material"; body.add(held);
    if (profile.task === "plank-walk" || profile.task === "board-placement") {
      box(profile.task === "plank-walk" ? 1.15 : .62,.042,.13,wood,held,[0,0,0]);
    } else if (profile.task === "clipboard-review") {
      box(.24,.018,.19,wood,held,[0,0,0]); box(.215,.006,.17,paper,held,[0,.012,0]);
      box(.04,.013,.025,tool,held,[0,.019,-.08]);
    } else if (["panel-fastening","table-marking","frame-square","ground-measure"].includes(profile.task)) {
      box(.045,.055,.07,tool,held,[0,0,0]);
      if (profile.task === "frame-square") { box(.018,.16,.016,tool,held,[.055,.06,0]); box(.12,.018,.016,tool,held,[0,-.013,0]); }
    } else if (profile.task === "tape-measure") {
      box(.035,.035,.04,tool,held,[0,0,0]);
    }
    const tape = profile.task === "tape-measure" ? box(.3,.009,.012,trim,body,[0,.16,.19]) : null;

    updates.push(phase => {
      const global = phase/TAU;
      const time = ((global+profile.phase)*profile.cycles)%1;
      const activity = bump(time,.1,.1+profile.work);
      const gesture = Math.sin(time*TAU)*activity;
      const idle = Math.sin(phase + profile.phase*TAU);
      let lean = profile.lean, turn = .035*idle, headPitch = .035*idle;
      let left: Point = [-.12,.035,.065], right: Point = [.12,.055,.08];
      let stride = 0, walkProgress = 0, moving = false;
      let propAt: Point | null = null;
      switch (profile.task) {
        case "plank-walk": case "site-walk": {
          // Walk, settle, turn, and return. Pauses and stride counts differ per route.
          const outboundEnd = profile.task === "plank-walk" ? .36 : .41;
          const inboundStart = .55, inboundEnd = profile.task === "plank-walk" ? .91 : .95;
          let heading = 0;
          if (time < outboundEnd) { walkProgress = smooth(time/outboundEnd); moving = true; stride = walkProgress; }
          else if (time < inboundStart) { walkProgress = 1; heading = Math.PI*smooth((time-outboundEnd)/(inboundStart-outboundEnd)); }
          else if (time < inboundEnd) { const progress = smooth((time-inboundStart)/(inboundEnd-inboundStart)); walkProgress = 1-progress; heading = Math.PI; moving = true; stride = progress; }
          else { heading = Math.PI+Math.PI*smooth((time-inboundEnd)/(1-inboundEnd)); }
          const distance = profile.task === "plank-walk" ? .65 : 1.05;
          person.position.x = profile.at[0]+Math.sin(profile.heading)*(walkProgress-.5)*distance;
          person.position.z = profile.at[2]+Math.cos(profile.heading)*(walkProgress-.5)*distance;
          person.rotation.y = profile.heading+heading;
          stride = Math.sin(stride*TAU*(profile.task === "plank-walk" ? 2 : 3));
          if (profile.task === "plank-walk") { propAt = [0,.12,.205]; left = [-.11,.115,.20]; right = [.11,.115,.20]; }
          else { left = [-.105,.02,.055+stride*.045]; right = [.105,.04,.055-stride*.045]; }
          lean += moving ? .025 : 0;
          break;
        }
        case "table-plans": left = [-.1,.25,.18]; right = [.08+gesture*.035,.255,.20]; lean += .035*activity; headPitch = .23; break;
        case "panel-fastening": left = [-.11,.25,.18]; right = [.105,.21+gesture*.022,.22]; headPitch = -.06; break;
        case "scaffold-bracing": left = [-.17,.17,.15]; right = [.08,.04+activity*.09,.21]; lean += .04*activity; turn = -.09; break;
        case "survey-scope": left = [-.10,.29,.14]; right = [.12,.22,.17]; headPitch = .08+activity*.06; lean += .035*activity; break;
        case "structure-inspection": left = [-.115,.01,.04]; right = [.10,.10+activity*.14,.12+activity*.06]; headPitch = -.19+activity*.12; turn = -.15+activity*.23; break;
        case "table-marking": left = [-.13,.23,.19]; right = [.07+gesture*.045,.255,.20]; headPitch = .25; lean += .025*activity; break;
        case "overhead-fit": left = [-.10,.39,.10]; right = [.12,.36+activity*.035,.13]; headPitch = -.23; turn = .06; break;
        case "tape-measure": left = [-.13-activity*.035,.16,.18]; right = [.10+activity*.05,.17,.19]; headPitch = .14; break;
        case "frame-square": left = [-.13,.18,.19]; right = [.10,.12+activity*.09,.20]; headPitch = .19; turn = -.07; break;
        case "scaffold-check": left = [-.17,.18,.13]; right = [.10,.06+activity*.035,.10]; headPitch = .22-activity*.2; turn = .11; break;
        case "panel-guidance": left = [-.145,.23+activity*.018,.17]; right = [.14,.26+activity*.02,.16]; headPitch = -.11; lean += .02*activity; break;
        case "board-placement": propAt = [0,.31-activity*.028,.205+activity*.01]; left = [-.11,propAt[1],propAt[2]]; right = [.11,propAt[1],propAt[2]]; headPitch = .19; lean += .025*activity; break;
        case "clipboard-review": propAt = [0,.11,.19]; left = [-.10,.105,.19]; right = [.055+gesture*.03,.14,.20]; headPitch = .26; break;
        case "ground-measure": left = [-.12,-.025,.16]; right = [.09,-.015+activity*.035,.17]; lean += .13*activity; headPitch = .22; break;
      }
      body.rotation.set(lean,turn,.008*idle);
      head.rotation.set(headPitch,.06*Math.sin(phase+profile.phase*13),index%2 ? .025 : -.02);
      for (const arm of arms) {
        const target = new THREE.Vector3(...(arm.side === -1 ? left : right));
        const shoulder = new THREE.Vector3(arm.side*.102,.205,0);
        arm.hand.position.copy(solveLimb(shoulder,target,new THREE.Vector3(arm.side*.75,-.5,-.4),.135,.13,arm.upper,arm.lower));
      }
      for (const leg of legs) {
        const swing = stride*leg.side;
        const z = leg.side*profile.stagger+(moving ? swing*.07 : 0);
        const lift = moving ? Math.max(0,swing)*.025 : 0;
        const ankle = new THREE.Vector3(leg.side*profile.stance,.047+lift,z);
        solveLimb(new THREE.Vector3(leg.side*.047,.32,0),ankle,new THREE.Vector3(0,0,1),.143,.148,leg.upper,leg.lower);
        leg.foot.position.set(ankle.x,.024+lift,ankle.z+.025);
      }
      held.position.copy(propAt ? new THREE.Vector3(...propAt) : arms[1].hand.position);
      held.rotation.x = profile.task === "clipboard-review" ? .17 : 0;
      if (tape) {
        const a = arms[0].hand.position, b = arms[1].hand.position;
        tape.position.copy(a).add(b).multiplyScalar(.5); tape.scale.x = a.distanceTo(b)/.3;
        tape.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),b.clone().sub(a).normalize());
      }
    });
  });
  return { group, geometries, materials, update(phase: number) { updates.forEach(update => update(phase)); } };
}
