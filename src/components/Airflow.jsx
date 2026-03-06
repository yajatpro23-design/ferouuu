import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

// Use Instances for high performance with thousands of streaks
export function Airflow() {
    const count = 500
    const instancesRef = useRef()

    const data = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 12
            const y = -2.8 + (Math.random() - 0.5) * 1
            const z = (Math.random() - 0.5) * 20
            const speed = 0.05 + Math.random() * 0.1 // Slower, more atmospheric
            const length = 2 + Math.random() * 5
            const opacity = 0.1 + Math.random() * 0.4

            temp.push({ x, y, z, speed, length, opacity, initialZ: z })
        }
        return temp
    }, [])

    useFrame((state, delta) => {
        if (!instancesRef.current) return

        // We can't update individual instances easily this way without losing performance benefits of Instances
        // unless we use per-instance transforms.
        // Actually, let's update children directly if using <Instances><Instance/></Instances> pattern

        // Wait, the children of <Instances> are not reliable for direct mesh manipulation in loop?
        // Let's use the 'ref' on each Instance
    })

    return (
        <Instances range={count} limit={count} ref={instancesRef}>
            <boxGeometry args={[0.005, 0.005, 1]} />
            <meshBasicMaterial
                color="#00BFFF"
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />

            {data.map((d, i) => (
                <Streak key={i} data={d} />
            ))}
        </Instances>
    )
}

function Streak({ data }) {
    const ref = useRef()

    useFrame((state, delta) => {
        if (!ref.current) return

        // Move forward
        ref.current.position.z += data.speed * (delta * 60) // Normalize speed

        // Fade in/out logic based on Z position to avoid popping?
        // Or just wrap around far away

        if (ref.current.position.z > 10) {
            ref.current.position.z = -15
            ref.current.position.x = (Math.random() - 0.5) * 10
            ref.current.position.y = -2.8 + (Math.random() - 0.5) * 1
        }
    })

    return (
        <Instance
            ref={ref}
            position={[data.x, data.y, data.z]}
            scale={[1, 1, data.length]}
            color={new THREE.Color("#00BFFF").multiplyScalar(1 + Math.random())} // Slight variation
        />
    )
}
