import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Shape({ position, rotation, scale, color, type }) {
    const meshRef = useRef()

    // Glassmorphism material props
    const transmissionProps = {
        thickness: 0.5,
        roughness: 0,
        transmission: 1,
        ior: 1.2,
        chromaticAberration: 0.02,
        backside: true,
    }

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1} position={position}>
            <mesh ref={meshRef} rotation={rotation} scale={scale}>
                {type === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
                {type === 'torus' && <torusGeometry args={[1, 0.4, 16, 100]} />}
                {type === 'octahedron' && <octahedronGeometry args={[1]} />}

                <MeshTransmissionMaterial {...transmissionProps} color={color} toneMapped={false} />
            </mesh>
        </Float>
    )
}

export function FloatingShapes() {
    const shapes = useMemo(() => [
        { type: 'sphere', position: [-4, 2, -2], scale: 0.8, color: '#00BFFF' },
        { type: 'torus', position: [4, -1, -3], scale: 1.2, color: '#9d00ff' },
        { type: 'octahedron', position: [-2, -3, -1], scale: 1, color: '#00BFFF' },
        { type: 'sphere', position: [3, 3, -4], scale: 1.5, color: '#9d00ff' },
        { type: 'torus', position: [-5, -2, -6], scale: 2, color: '#00BFFF' },
    ], [])

    return (
        <group>
            {shapes.map((s, i) => (
                <Shape key={i} {...s} />
            ))}
        </group>
    )
}
