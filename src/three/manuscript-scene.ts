import * as THREE from "three";

/*
 * A sheet of genkō yōshi floating in space. Text is laid out the traditional
 * way — vertical columns read right to left — and every character is an
 * instanced quad sampling a glyph atlas, so the whole page is two draw calls.
 */

const COLS = 20;
const ROWS = 12;
const PITCH = 1.2; // column band: a 1.0 square plus the narrow ruby gutter
const SHEET_W = COLS * PITCH;
const SHEET_H = ROWS;
const MARGIN = 0.9;

const PUNCTUATION = new Set(["、", "。"]);

type Placement = { char: string; col: number; row: number; title?: boolean };

// Column 0 is the rightmost column; rows count down from the top.
function layoutManuscript(): Placement[] {
	const placements: Placement[] = [];
	const place = (text: string, col: number, row: number, title = false) => {
		let c = col;
		let r = row;
		for (const char of text) {
			if (r >= ROWS) {
				c += 1;
				r = 0;
			}
			placements.push({ char, col: c, row: r, title });
			r += 1;
		}
		return r === 0 ? c : c + 1;
	};

	place("手で覚える日本語", 1, 2, true);
	let col = 3;
	for (const paragraph of [
		"書くことは覚えること。",
		"一画ずつ、一文ずつ、日本語を自分の手に。",
		"毎日少しずつ、綴っていこう。",
	]) {
		col = place(paragraph, col, 1);
	}
	return placements;
}

const DISPLACE = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uMouseStrength;

float sheetWave(vec2 p) {
	return sin(p.x * 0.22 + uTime * 0.35) * 0.32 + cos(p.y * 0.31 + uTime * 0.27) * 0.22;
}

float sheetCurl(vec2 p) {
	float fromLeft = clamp((p.x + ${(SHEET_W / 2 + MARGIN).toFixed(2)}) / ${(SHEET_W + MARGIN * 2).toFixed(2)}, 0.0, 1.0);
	return pow(1.0 - fromLeft, 2.6) * (0.6 + uScroll * 7.0);
}

float pointerLift(vec2 p) {
	return smoothstep(3.6, 0.0, distance(p, uMouse)) * uMouseStrength;
}

float sheetHeight(vec2 p) {
	return sheetWave(p) + sheetCurl(p) + pointerLift(p) * 0.55;
}
`;

const sheetVertex = /* glsl */ `
${DISPLACE}
varying vec2 vSheet;
varying vec3 vWorld;

void main() {
	vec3 p = position;
	p.z += sheetHeight(p.xy);
	vSheet = position.xy;
	vec4 world = modelMatrix * vec4(p, 1.0);
	vWorld = world.xyz;
	gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const sheetFragment = /* glsl */ `
uniform vec3 uPaper;
uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uIntro;
uniform float uScroll;
varying vec2 vSheet;
varying vec3 vWorld;

// Lines never get thinner than a pixel; they fade instead, which avoids
// the dashed moiré thin rules produce at a distance.
float band(float v, float width) {
	float aa = fwidth(v);
	float w = max(width, aa * 0.75);
	return (1.0 - smoothstep(w, w + aa, abs(v))) * clamp(width / w, 0.35, 1.0);
}

void main() {
	vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
	float light = 0.82 + 0.18 * max(dot(n, normalize(vec3(-0.4, 0.6, 1.0))), 0.0);

	vec2 local = vSheet + vec2(${(SHEET_W / 2).toFixed(2)}, ${(SHEET_H / 2).toFixed(2)});
	bool inside = local.x > 0.0 && local.x < ${SHEET_W.toFixed(2)} && local.y > 0.0 && local.y < ${SHEET_H.toFixed(2)};

	float lines = 0.0;
	if (inside) {
		float u = mod(local.x, ${PITCH.toFixed(2)}) - 0.1;
		float cell = step(0.0, u) * step(u, 1.0);
		float rowEdge = band(fract(local.y + 0.5) - 0.5, 0.012);
		float colEdge = max(band(u, 0.012), band(u - 1.0, 0.012));
		lines = max(colEdge, rowEdge * cell);
	}
	float border = 0.0;
	vec2 edge = abs(vSheet) - vec2(${(SHEET_W / 2).toFixed(2)}, ${(SHEET_H / 2).toFixed(2)});
	border = band(max(edge.x, edge.y), 0.035);

	// Rule lines draw in from the right edge during the intro, the way the
	// page is written.
	float fromRight = ${SHEET_W.toFixed(2)} - local.x;
	float sweep = smoothstep(fromRight - 6.0, fromRight, uIntro * ${(SHEET_W + 8).toFixed(2)} - 4.0);
	float gutter = mod(local.x, ${PITCH.toFixed(2)});
	float ruby = inside ? step(1.1, gutter) * 0.06 : 0.0;

	vec3 color = uPaper * light;
	color = mix(color, uAccent, ruby * sweep);
	color = mix(color, uLine, max(lines, border) * 0.72 * sweep);
	gl_FragColor = vec4(color, 1.0 - uScroll * 0.15);
}
`;

const glyphVertex = /* glsl */ `
${DISPLACE}
attribute vec2 aCell;
attribute float aGlyph;
attribute float aOrder;
attribute vec4 aRand;
attribute float aTitle;
uniform float uAtlasCols;
uniform float uReveal;
varying vec2 vUv;
varying float vLift;
varying float vAlpha;
varying float vTitle;

mat2 rotate(float a) {
	float s = sin(a), c = cos(a);
	return mat2(c, -s, s, c);
}

void main() {
	float scatter = smoothstep(0.0, 1.0, clamp((uScroll - aRand.w * 0.35) / 0.65, 0.0, 1.0));
	float lift = pointerLift(aCell);

	vec3 quad = position * (1.0 + lift * 0.18 + scatter * 0.6);
	quad.xy = rotate(aRand.x * 6.2831 * scatter) * quad.xy;
	quad.yz = rotate(aRand.y * 3.1416 * scatter) * quad.yz;

	vec3 base = vec3(aCell, sheetHeight(aCell) + 0.02 + lift * 1.3);
	base += (aRand.xyz - 0.5) * vec3(26.0, 18.0, 22.0) * scatter + vec3(0.0, 0.0, 6.0 * scatter);

	vec4 world = modelMatrix * vec4(base + quad, 1.0);
	gl_Position = projectionMatrix * viewMatrix * world;

	float tile = 1.0 / uAtlasCols;
	vec2 origin = vec2(mod(aGlyph, uAtlasCols), floor(aGlyph / uAtlasCols)) * tile;
	vUv = origin + vec2(uv.x, 1.0 - uv.y) * tile;
	vLift = max(lift, scatter * 0.8);
	vAlpha = smoothstep(aOrder, aOrder + 1.5, uReveal) * (1.0 - smoothstep(0.75, 1.0, uScroll) * 0.6);
	vTitle = aTitle;
}
`;

const glyphFragment = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uInk;
uniform vec3 uAccent;
varying vec2 vUv;
varying float vLift;
varying float vAlpha;
varying float vTitle;

void main() {
	float a = texture2D(uAtlas, vec2(vUv.x, 1.0 - vUv.y)).a * vAlpha;
	if (a < 0.01) discard;
	vec3 color = mix(uInk, uAccent, clamp(max(vLift * 1.4, vTitle), 0.0, 1.0));
	gl_FragColor = vec4(color, a);
}
`;

function buildAtlas(chars: string[], font: string) {
	const cols = Math.ceil(Math.sqrt(chars.length));
	const tile = 160;
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = cols * tile;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2D canvas unavailable");

	ctx.fillStyle = "#fff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = `500 ${tile * 0.74}px ${font}`;
	chars.forEach((char, i) => {
		const x = (i % cols) * tile;
		const y = Math.floor(i / cols) * tile;
		// Vertical writing parks punctuation in the top-right of its square.
		if (PUNCTUATION.has(char)) {
			ctx.fillText(char, x + tile * 0.78, y + tile * 0.24);
		} else {
			ctx.fillText(char, x + tile / 2, y + tile / 2 + tile * 0.03);
		}
	});

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.NoColorSpace;
	texture.anisotropy = 4;
	return { texture, cols };
}

export type ManuscriptColors = {
	paper: string;
	ink: string;
	line: string;
	accent: string;
};

export class ManuscriptScene {
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
	private group = new THREE.Group();
	private uniforms: Record<string, THREE.IUniform>;
	private raycaster = new THREE.Raycaster();
	private plane = new THREE.Plane();
	private pointer = new THREE.Vector2(0, 0);
	private pointerTarget = new THREE.Vector3(99, 99, 0);
	private tilt = new THREE.Vector2();
	private scroll = 0;
	private lastTime = 0;
	private running = false;
	private frame = 0;
	private disposables: { dispose(): void }[] = [];
	readonly glyphCount: number;

	constructor(
		private canvas: HTMLCanvasElement,
		colors: ManuscriptColors,
		font: string,
	) {
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
			powerPreference: "high-performance",
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const placements = layoutManuscript();
		const unique = [...new Set(placements.map((p) => p.char))];
		const atlas = buildAtlas(unique, font);
		this.glyphCount = placements.length;

		this.uniforms = {
			uTime: { value: 0 },
			uScroll: { value: 0 },
			uIntro: { value: 0 },
			uReveal: { value: 0 },
			uMouse: { value: new THREE.Vector2(99, 99) },
			uMouseStrength: { value: 0 },
			uPaper: { value: new THREE.Color(colors.paper) },
			uInk: { value: new THREE.Color(colors.ink) },
			uLine: { value: new THREE.Color(colors.line) },
			uAccent: { value: new THREE.Color(colors.accent) },
			uAtlas: { value: atlas.texture },
			uAtlasCols: { value: atlas.cols },
		};

		const sheetGeometry = new THREE.PlaneGeometry(
			SHEET_W + MARGIN * 2,
			SHEET_H + MARGIN * 2,
			160,
			90,
		);
		const sheetMaterial = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: sheetVertex,
			fragmentShader: sheetFragment,
			transparent: true,
			side: THREE.DoubleSide,
		});
		const sheet = new THREE.Mesh(sheetGeometry, sheetMaterial);
		sheet.renderOrder = 0;
		this.group.add(sheet);

		const glyphGeometry = new THREE.InstancedBufferGeometry();
		const quad = new THREE.PlaneGeometry(0.84, 0.84);
		glyphGeometry.index = quad.index;
		glyphGeometry.setAttribute("position", quad.getAttribute("position"));
		glyphGeometry.setAttribute("uv", quad.getAttribute("uv"));

		const cells = new Float32Array(placements.length * 2);
		const glyphs = new Float32Array(placements.length);
		const order = new Float32Array(placements.length);
		const rand = new Float32Array(placements.length * 4);
		const title = new Float32Array(placements.length);
		placements.forEach((p, i) => {
			cells[i * 2] = SHEET_W / 2 - (p.col + 0.5) * PITCH;
			cells[i * 2 + 1] = SHEET_H / 2 - (p.row + 0.5);
			glyphs[i] = unique.indexOf(p.char);
			order[i] = i;
			for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
			title[i] = p.title ? 1 : 0;
		});
		glyphGeometry.setAttribute(
			"aCell",
			new THREE.InstancedBufferAttribute(cells, 2),
		);
		glyphGeometry.setAttribute(
			"aGlyph",
			new THREE.InstancedBufferAttribute(glyphs, 1),
		);
		glyphGeometry.setAttribute(
			"aOrder",
			new THREE.InstancedBufferAttribute(order, 1),
		);
		glyphGeometry.setAttribute(
			"aRand",
			new THREE.InstancedBufferAttribute(rand, 4),
		);
		glyphGeometry.setAttribute(
			"aTitle",
			new THREE.InstancedBufferAttribute(title, 1),
		);
		glyphGeometry.instanceCount = placements.length;

		const glyphMaterial = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: glyphVertex,
			fragmentShader: glyphFragment,
			transparent: true,
			depthWrite: false,
		});
		const glyphMesh = new THREE.Mesh(glyphGeometry, glyphMaterial);
		glyphMesh.frustumCulled = false;
		glyphMesh.renderOrder = 1;
		this.group.add(glyphMesh);

		this.scene.add(this.group);
		this.disposables.push(
			sheetGeometry,
			sheetMaterial,
			glyphGeometry,
			glyphMaterial,
			quad,
			atlas.texture,
		);
		this.resize();
	}

	get intro() {
		return this.uniforms.uIntro;
	}

	get reveal() {
		return this.uniforms.uReveal;
	}

	setScroll(progress: number) {
		this.scroll = progress;
		if (!this.running) this.render();
	}

	setPointer(x: number, y: number) {
		this.pointer.set(x, y);
		this.uniforms.uMouseStrength.value = 1;
	}

	clearPointer() {
		this.uniforms.uMouseStrength.value = 0;
	}

	resize() {
		const { clientWidth: w, clientHeight: h } = this.canvas;
		if (!w || !h) return;
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		if (!this.running) this.render();
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.lastTime = performance.now();
		const loop = () => {
			if (!this.running) return;
			this.render();
			this.frame = requestAnimationFrame(loop);
		};
		loop();
	}

	stop() {
		this.running = false;
		cancelAnimationFrame(this.frame);
	}

	render() {
		const now = performance.now();
		const dt = Math.min((now - this.lastTime) / 1000, 1 / 20);
		this.lastTime = now;
		const u = this.uniforms;
		u.uTime.value += dt;
		u.uScroll.value += (this.scroll - u.uScroll.value) * Math.min(1, dt * 6);

		const s = u.uScroll.value;
		const aspect = this.camera.aspect;
		const narrow = aspect < 0.9;
		this.tilt.lerp(this.pointer, Math.min(1, dt * 2.5));

		// Frame roughly 34 units of the page across, whatever the viewport.
		const fit =
			34 / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * Math.max(aspect, 0.6));
		const distance = THREE.MathUtils.clamp(fit, 30, 64);
		const visibleWidth =
			2 * Math.tan(THREE.MathUtils.degToRad(16)) * distance * aspect;

		this.group.rotation.set(
			-0.58 + s * 0.45 + this.tilt.y * 0.06,
			(narrow ? -0.12 : -0.3) + s * 0.5 + this.tilt.x * 0.08,
			(narrow ? 0.04 : 0.1) - s * 0.18,
		);
		this.group.position.set(
			// On phones, slide the written right-hand columns into view.
			narrow ? -5.5 + s * 4 : visibleWidth * 0.08 - s * 4,
			(narrow ? 5 : 0.8) + s * 1.5,
			0,
		);
		this.camera.position.set(0, 0, distance - s * 8);
		this.camera.lookAt(0, 0, 0);
		this.group.updateMatrixWorld();

		// Project the cursor onto the sheet so letters near it lift off the page.
		this.raycaster.setFromCamera(this.pointer, this.camera);
		this.plane.setFromNormalAndCoplanarPoint(
			new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion),
			this.group.position,
		);
		const hit = new THREE.Vector3();
		if (this.raycaster.ray.intersectPlane(this.plane, hit)) {
			this.group.worldToLocal(hit);
			this.pointerTarget.lerp(hit, Math.min(1, dt * 8));
			(u.uMouse.value as THREE.Vector2).set(
				this.pointerTarget.x,
				this.pointerTarget.y,
			);
		}

		this.renderer.render(this.scene, this.camera);
	}

	dispose() {
		this.stop();
		for (const item of this.disposables) item.dispose();
		this.renderer.dispose();
	}
}
