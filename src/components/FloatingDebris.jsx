import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

export function FloatingDebris({ count = 100 }) {
    const meshRef = useRef()

    const dummy = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const position = [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 50 - 20, // Distributed along the scroll path
                (Math.random() - 0.5) * 20
            ]
            const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
            const scale = 0.05 + Math.random() * 0.1
            const speed = 0.2 + Math.random() * 0.5
            temp.push({ position, rotation, scale, speed })
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return
        const time = state.clock.getElapsedTime()
        // Small orbital movement for antigravity feel
    })

    return (
        <Instances range={count} limit={count}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color="#ffffff"
                metalness={1}
                roughness={0.2}
                emissive="#00BFFF"
                emissiveIntensity={0.5}
            />
            {dummy.map((d, i) => (
                <DebrisItem key={i} data={d} />
            ))}
        </Instances>
    )
}

function DebrisItem({ data }) {
    const ref = useRef()
    useFrame((state) => {
        if (!ref.current) return
        const time = state.clock.getElapsedTime()
        ref.current.position.y += Math.sin(time * data.speed) * 0.005
        ref.current.rotation.x += 0.01 * data.speed
        ref.current.rotation.y += 0.012 * data.speed
    })
    return (
        <Instance
            ref={ref}
            position={data.position}
            rotation={data.rotation}
            scale={data.scale}
        />
    )
}
