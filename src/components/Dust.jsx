import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Instance, Instances } from '@react-three/drei'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js'

// Need to define SimplexNoise inside or import it. Three.js math utils don't expose it directly in recent versions
// Let's use simple Math.sin for drift instead of dragging noise dep.
// Or just basic turbulence.

export function Dust({ count = 2000 }) {
    const points = useRef()

    // 2000 Particles
    // Use InstancedMesh for performance if we want shapes, but Points is faster for tiny specks.
    // Let's stick to Points with custom shader for "sparkle"?
    // Or just PointsMaterial with sizeAttenuation.

    // To make them "drift slowly", we update positions in useFrame.

    const particles = useMemo(() => {
        const p = new Float32Array(count * 3)
        const v = new Float32Array(count * 3) // Velocity
        const s = new Float32Array(count) // Size
        const o = new Float32Array(count) // Offset for movement

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 15
            const y = (Math.random() - 0.5) * 10
            const z = (Math.random() - 0.5) * 20

            p[i * 3] = x
            p[i * 3 + 1] = y
            p[i * 3 + 2] = z

            // Slow Drift
            v[i * 3] = (Math.random() - 0.5) * 0.005
            v[i * 3 + 1] = (Math.random() - 0.5) * 0.005
            v[i * 3 + 2] = (Math.random() - 0.5) * 0.005

            s[i] = Math.random()
            o[i] = Math.random() * 100
        }
        return { p, v, s, o }
    }, [count])

    useFrame((state) => {
        if (!points.current) return

        const time = state.clock.elapsedTime
        const positions = points.current.geometry.attributes.position.array

        for (let i = 0; i < count; i++) {
            const idx = i * 3

            // Basic Drift
            let x = positions[idx]
            let y = positions[idx + 1]
            let z = positions[idx + 2]

            // Add wave drift
            x += Math.sin(time * 0.5 + particles.o[i]) * 0.002
            y += Math.cos(time * 0.3 + particles.o[i]) * 0.002
            z += Math.sin(time * 0.2 + particles.o[i]) * 0.002

            // Add constant flow (if airflow is active)
            // But user wants "Slow drifting", not storm, unless near vent.

            // Collision Logic with Laptop Vent (approx [0, -2.5, 0])
            // If close, deflect/sparkle
            const dist = Math.sqrt(x * x + (y + 2.5) * (y + 2.5) + z * z)

            if (dist < 2.0) {
                // Push away gently
                const push = (2.0 - dist) * 0.01
                x += x * push
                y += (y + 2.5) * push
                z += z * push * 2 // Push back strongly in Z

                // Sparkle? We can't easily change color per-vertex in PointsMaterial without custom shader.
                // But we can move it fast to simulate excitement.
            }

            // Wrap around
            if (z > 10) z = -10
            if (z < -10) z = 10
            if (y > 5) y = -5
            if (y < -5) y = 5

            positions[idx] = x
            positions[idx + 1] = y
            positions[idx + 2] = z
        }

        points.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.p}
                    itemSize={3}
                />
            </bufferGeometry>
            {/* Custom Shader Material for Sparkles? Or simple PointsMaterial */}
            {/* Let's use a sprite for "sparkle" look */}
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
