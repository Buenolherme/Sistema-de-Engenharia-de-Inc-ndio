import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface ThreeSceneProps {
  modelUrl?: string;
  showEscapeRoutes: boolean;
  blueprintMode: boolean;
  wireframeMode: boolean;
  showLighting: boolean;
}

export default function ThreeScene({ modelUrl, showEscapeRoutes, blueprintMode, wireframeMode, showLighting }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const escapeGroupRef = useRef<THREE.Group | null>(null);
  const animRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [modelError, setModelError] = useState('');

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setReady(false);
    setModelError('');

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(blueprintMode ? '#0a1628' : '#050810');
    scene.fog = new THREE.Fog(blueprintMode ? '#0a1628' : '#050810', 30, 80);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(20, 18, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 8;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x4488ff, showLighting ? 1.5 : 0.3);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff4444, 0.8, 30);
    pointLight.position.set(-5, 8, -5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x4488ff, 0.5, 25);
    pointLight2.position.set(5, 6, 5);
    scene.add(pointLight2);

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? 0x0a2040 : 0x1a1a2e,
      roughness: 0.8,
      wireframe: wireframeMode,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? 0x1a3a6a : 0x2a2a3e,
      roughness: 0.6,
      wireframe: wireframeMode,
      transparent: true,
      opacity: blueprintMode ? 0.3 : 0.85,
    });
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xcc4444,
      roughness: 0.4,
      wireframe: wireframeMode,
    });
    const hydrantMat = new THREE.MeshStandardMaterial({
      color: 0xdd2222,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: wireframeMode,
    });
    const sprinklerMat = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      roughness: 0.3,
      metalness: 0.5,
      wireframe: wireframeMode,
    });
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x22cc44,
      emissive: 0x22cc44,
      emissiveIntensity: 0.5,
      wireframe: wireframeMode,
    });
    const stairMat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? 0x2244aa : 0x3a3a4e,
      roughness: 0.5,
      wireframe: wireframeMode,
    });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 18), floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(24, 24, 0x1a3a6a, 0x0a1a3a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Walls
    const wallH = 3.5;
    const wallT = 0.2;
    const createWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };

    // Outer walls
    createWall(24, wallH, wallT, 0, wallH / 2, -9);
    createWall(24, wallH, wallT, 0, wallH / 2, 9);
    createWall(wallT, wallH, 18, -12, wallH / 2, 0);
    createWall(wallT, wallH, 18, 12, wallH / 2, 0);

    // Interior walls
    createWall(0.2, wallH, 10, -4, wallH / 2, -4);
    createWall(0.2, wallH, 10, 4, wallH / 2, -4);
    createWall(8, wallH, 0.2, 0, wallH / 2, 2);
    createWall(8, wallH, 0.2, -8, wallH / 2, -2);

    // Fire doors (red)
    const createDoor = (x: number, y: number, z: number, rotY: number) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.1), doorMat);
      door.position.set(x, y, z);
      door.rotation.y = rotY;
      door.castShadow = true;
      scene.add(door);

      // Door frame glow
      const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 2.7, 0.12));
      const frameMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.6 });
      const frame = new THREE.LineSegments(frameGeo, frameMat);
      frame.position.copy(door.position);
      frame.rotation.copy(door.rotation);
      scene.add(frame);
    };

    createDoor(-4, 1.25, 1, 0);
    createDoor(4, 1.25, 1, 0);
    createDoor(0, 1.25, 2, Math.PI / 2);
    createDoor(-12, 1.25, -3, Math.PI / 2);
    createDoor(12, 1.25, 3, Math.PI / 2);

    // Hydrants
    const createHydrant = (x: number, z: number) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8), hydrantMat);
      body.position.y = 0.4;
      body.castShadow = true;
      group.add(body);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), hydrantMat);
      top.position.y = 0.85;
      group.add(top);
      const side1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), hydrantMat);
      side1.position.set(0.2, 0.6, 0);
      side1.rotation.z = Math.PI / 2;
      group.add(side1);
      group.position.set(x, 0, z);
      scene.add(group);
    };

    createHydrant(-10, -7);
    createHydrant(10, -7);
    createHydrant(-10, 7);
    createHydrant(10, 7);

    // Sprinklers on ceiling
    const createSprinkler = (x: number, z: number) => {
      const group = new THREE.Group();
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), sprinklerMat);
      pipe.position.y = wallH - 0.25;
      group.add(pipe);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.1, 8), sprinklerMat);
      head.position.y = wallH - 0.55;
      group.add(head);
      // Glow ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.15, 16),
        new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      );
      ring.position.y = wallH - 0.6;
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);
      group.position.set(x, 0, z);
      scene.add(group);
    };

    for (let x = -8; x <= 8; x += 4) {
      for (let z = -6; z <= 6; z += 4) {
        createSprinkler(x, z);
      }
    }

    // Emergency signs (green glowing)
    const createSign = (x: number, y: number, z: number, rotY: number) => {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), signMat);
      sign.position.set(x, y, z);
      sign.rotation.y = rotY;
      scene.add(sign);

      const light = new THREE.PointLight(0x22cc44, 0.3, 3);
      light.position.set(x, y, z);
      scene.add(light);
    };

    createSign(-11.8, 2.5, -5, 0);
    createSign(11.8, 2.5, -5, Math.PI);
    createSign(-11.8, 2.5, 5, 0);
    createSign(11.8, 2.5, 5, Math.PI);
    createSign(-6, 2.5, -8.8, Math.PI / 2);
    createSign(6, 2.5, -8.8, Math.PI / 2);

    // Stairs
    const createStairs = (x: number, z: number) => {
      const group = new THREE.Group();
      for (let i = 0; i < 10; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 0.6), stairMat);
        step.position.y = i * 0.3 + 0.075;
        step.position.z = i * 0.3;
        step.castShadow = true;
        group.add(step);
      }
      // Railing
      const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.5, 6);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x4466aa, wireframe: wireframeMode });
      const rail1 = new THREE.Mesh(railGeo, railMat);
      rail1.position.set(0.9, 1.75, 1.5);
      rail1.rotation.x = Math.atan2(3, 3);
      group.add(rail1);
      const rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set(-0.9, 1.75, 1.5);
      rail2.rotation.x = Math.atan2(3, 3);
      group.add(rail2);

      group.position.set(x, 0, z);
      scene.add(group);
    };

    createStairs(-9, -6);
    createStairs(9, 6);

    // Escape routes group
    const escapeGroup = new THREE.Group();
    escapeGroupRef.current = escapeGroup;

    const routeMat = new THREE.MeshBasicMaterial({ color: 0x22cc44, transparent: true, opacity: 0.4 });
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x44ff66, transparent: true, opacity: 0.8 });

    // Route paths (flat arrows on floor)
    const createRoute = (points: THREE.Vector3[]) => {
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        center.y = 0.05;

        const path = new THREE.Mesh(new THREE.BoxGeometry(len, 0.02, 0.3), routeMat);
        path.position.copy(center);
        path.rotation.y = Math.atan2(dir.x, dir.z);
        escapeGroup.add(path);

        // Arrow heads
        if (i < points.length - 2) {
          const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 3), arrowMat);
          arrow.position.copy(center);
          arrow.position.y = 0.1;
          arrow.rotation.x = -Math.PI / 2;
          arrow.rotation.z = Math.atan2(dir.x, dir.z);
          escapeGroup.add(arrow);
        }
      }
    };

    // Define escape routes
    createRoute([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(0, 0, 8),
      new THREE.Vector3(11, 0, 8),
    ]);
    createRoute([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5),
      new THREE.Vector3(-8, 0, -5),
      new THREE.Vector3(-11, 0, -5),
    ]);
    createRoute([
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-10, 0, -6),
    ]);
    createRoute([
      new THREE.Vector3(6, 0, 0),
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(10, 0, 6),
    ]);

    escapeGroup.visible = showEscapeRoutes;
    scene.add(escapeGroup);

    let disposed = false;

    const addUploadedModel = (object: THREE.Object3D) => {
      const modelMaterial = new THREE.MeshStandardMaterial({
        color: blueprintMode ? 0x60a5fa : 0x8bbcff,
        emissive: blueprintMode ? 0x0f3b75 : 0x061a33,
        emissiveIntensity: blueprintMode ? 0.35 : 0.12,
        roughness: 0.55,
        metalness: 0.15,
        wireframe: wireframeMode,
        transparent: true,
        opacity: blueprintMode ? 0.62 : 0.88,
      });

      object.traverse(child => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = modelMaterial.clone();
      });

      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const largest = Math.max(size.x, size.y, size.z) || 1;
      const scale = Math.min(12 / largest, 4);

      object.position.sub(center);
      object.scale.setScalar(scale);

      const normalizedBox = new THREE.Box3().setFromObject(object);
      object.position.y -= normalizedBox.min.y;
      object.position.z += 0.5;

      scene.add(object);
    };

    const loadUploadedModel = async () => {
      if (!modelUrl) return;

      const cleanUrl = modelUrl.split('?')[0].toLowerCase();
      let object: THREE.Object3D | null = null;

      if (cleanUrl.endsWith('.glb') || cleanUrl.endsWith('.gltf')) {
        object = (await new GLTFLoader().loadAsync(modelUrl)).scene;
      } else if (cleanUrl.endsWith('.obj')) {
        object = await new OBJLoader().loadAsync(modelUrl);
      } else if (cleanUrl.endsWith('.stl')) {
        const geometry = await new STLLoader().loadAsync(modelUrl);
        object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      } else if (cleanUrl.endsWith('.fbx')) {
        object = await new FBXLoader().loadAsync(modelUrl);
      }

      if (!disposed && object) addUploadedModel(object);
    };

    void loadUploadedModel().catch(() => {
      if (!disposed) setModelError('Modelo 3D indisponível. A cena técnica padrão foi mantida.');
    });

    // Animate
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    setReady(true);

    // Resize
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [blueprintMode, wireframeMode, showLighting, showEscapeRoutes, modelUrl]);

  useEffect(() => {
    const cleanup = init();
    return () => { if (cleanup) cleanup(); };
  }, [init]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050810]">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500 text-mono">Carregando modelo 3D...</p>
          </div>
        </div>
      )}
      {modelError && (
        <div className="absolute bottom-4 right-4 max-w-xs rounded-lg border border-amber-500/20 bg-[#0a1628]/90 px-3 py-2 text-xs text-amber-300">
          {modelError}
        </div>
      )}
    </div>
  );
}
