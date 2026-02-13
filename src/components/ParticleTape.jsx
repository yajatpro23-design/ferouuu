import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshTransmissionMaterial } from '@react-three/drei'

export function ParticleTape({ count = 50000, ...props }) {
    const points = useRef()
    const mouseTarget = useRef(new THREE.Vector3(0, 0, 0))

    // Generate particles in the shape of a tape roll (Hollow Cylinder)
    const particles = useMemo(() => {
        const temp = []
        const innerRadius = 2.0
        const outerRadius = 2.8
        const height = 1.5

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2

            // Volumetric distribution
            const r = innerRadius + Math.random() * (outerRadius - innerRadius)

            const x = r * Math.cos(theta)
            const z = r * Math.sin(theta)
            const y = (Math.random() - 0.5) * height

            temp.push(x, y, z)
        }
        return new Float32Array(temp)
    }, [count])

    // Custom Shader for "Breathing" + "Reactive" Particles
    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#00ffff') }, // Cyan
            uMouse: { value: new THREE.Vector3(0, 0, 0) }, // Interaction point
            uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 2 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uPixelRatio;
            uniform vec3 uMouse;
            attribute float size;
            varying float vAlpha;
            
            // Simplex Noise (simplified)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute( 
                          i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857; 
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ ); 
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                              dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                vec3 pos = position;
                
                // 1. Interactive Repulsion
                // uMouse is already transformed to local space (approx)
                float dist = distance(pos, uMouse);
                float radius = 3.5; // Interaction radius
                float repulsion = max(0.0, radius - dist);
                
                // Smooth falloff
                repulsion = smoothstep(0.0, radius, repulsion); 
                
                // Push particles away from mouse
                vec3 pushDir = normalize(pos - uMouse);
                // Stronger push
                pos += pushDir * repulsion * 0.8;

                // 2. "Breathing" Noise Displacement
                // Add turbulence based on repulsion (agitated state)
                float agitation = repulsion * 3.0;
                float noiseVal = snoise(vec3(pos.x * 0.5, pos.y * 0.5 + uTime * 0.2, pos.z * 0.5));
                
                // Displace along normal
                vec3 normal = normalize(vec3(pos.x, 0.0, pos.z));
                pos += normal * (noiseVal * 0.2 + agitation * 0.15); 
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Size attenuation
                gl_PointSize = 2.5 * uPixelRatio * (1.0 / -mvPosition.z);
                
                // Fade edges + Reactivity Glow
                vAlpha = 0.4 + 0.4 * sin(noiseVal * 10.0 + uTime);
                vAlpha += repulsion * 0.5; // Much brighter when touched
                vAlpha = min(vAlpha, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                
                float glow = 1.0 - (r * 2.0);
                glow = pow(glow, 1.5);
                
                gl_FragColor = vec4(uColor, vAlpha * glow);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.y += 0.005
            points.current.material.uniforms.uTime.value = state.clock.elapsedTime

            // Mouse Interaction Logic
            // The object is at [0, 0, 0] local space (because it's inside a group at [0, -20, 0] in Scene)
            // Local 0,0,0 is World 0,-20,0

            // Mapping viewport (-width/2 to width/2) to local coords
            // Since camera is at z=6 (relative to tape), and FOV is default (probably 50 or 75)
            // Just mapping state.mouse (normalized -1 to 1) to a factor works well enough visually.

            // Mouse X (-1 to 1) -> World X (-8 to 8 roughly for viewport width)
            const tx = state.mouse.x * 8.0
            // Mouse Y (-1 to 1) -> World Y (-5 to 5 roughly)
            const ty = state.mouse.y * 5.0

            // Z depth: The cylinder surface is at z ~ 2.8.
            // We want mouse to interact on the front surface.
            const tz = 2.5

            // Account for rotation?
            // If the object rotates, the "local" mouse position needs to counter-rotate??
            // Yes, because `pos` in vertex shader is local position (attribute).
            // So if object rotates, we need to rotate our mouse point inverse to match.

            const inverseRotation = -points.current.rotation.y
            const rx = tx * Math.cos(inverseRotation) - tz * Math.sin(inverseRotation)
            const rz = tx * Math.sin(inverseRotation) + tz * Math.cos(inverseRotation)

            // Let's just use unthe transformed tx,ty and see. 
            // Actually, for "Repulsion" it's cooler if the repulsion field stays static in screen space 
            // and the particles move through it.
            // If we update uMouse uniform, that uniform is in "Model Space" if using `pos`.
            // BUT wait, `pos` attribute is model space. `uMouse` should be model space.

            // To make "Screen Space" interaction, we'd need to inverse transform the world mouse into model space.
            // Simplified: Just applying rotation compensation is best.

            const vec = new THREE.Vector3(tx, ty, tz)
            vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), -points.current.rotation.y)

            mouseTarget.current.copy(vec)

            // Smoothly interpolate current uniform value to target
            points.current.material.uniforms.uMouse.value.lerp(mouseTarget.current, 0.2)
        }
    })

    return (
        <group {...props}>
            {/* 1. The Particle Tape Volume */}
            <points ref={points}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <shaderMaterial args={[shaderArgs]} />
            </points>

            {/* 2. The Holographic Ring Light (Above) */}
            <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[4, 0.05, 16, 100]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            {/* Glow for Ring */}
            <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[4, 0.2, 16, 100]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} toneMapped={false} />
            </mesh>

            {/* 3. The Platform (Below) */}
            <group position={[0, -3, 0]}>
                {/* Main Floor Disk */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[8, 64]} />
                    <meshStandardMaterial
                        color="#0a0a0a"
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
                {/* Decorative Concentric Rings (HUD style) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[3.8, 3.85, 64]} />
                    <meshBasicMaterial color="#00ffff" opacity={0.4} transparent />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <ringGeometry args={[5, 5.02, 64]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
                </mesh>
            </group>

            {/* 4. Volumetric Light / Spot from top */}
            <spotLight
                position={[0, 10, 0]}
                angle={0.6}
                penumbra={0.5}
                intensity={2}
                color="#00ffff"
                distance={20}
                decay={2}
            />
        </group>
    )
}
