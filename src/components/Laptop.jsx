import { useRef, useLayoutEffect } from 'react'
import { Box, Circle, Edges } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export function Laptop() {
    const group = useRef()
    const ventRef = useRef()
    const highlightRef = useRef()

    useLayoutEffect(() => {
        // Vent Highlight Pulse during Alignment Phase (60-85% scroll approx)
        // We can hook into the main GSAP timeline or just use a local one triggered by scroll

        gsap.to(highlightRef.current.material, {
            opacity: 0.8,
            duration: 1,
            yoyo: true,
            repeat: -1,
            scrollTrigger: {
                trigger: ".ui-container",
                start: "60% top",
                end: "85% top",
                toggleActions: "play reverse play reverse",
            }
        })

        // Hide highlight after application
        gsap.to(highlightRef.current.material, {
            opacity: 0,
            duration: 0.5,
            scrollTrigger: {
                trigger: ".ui-container",
                start: "90% top",
                toggleActions: "play none none reverse",
            }
        })
    }, [])

    return (
        <group ref={group} dispose={null} rotation={[0, 0, 0]}>
            {/* Main Chassis - Premium Aluminum Finish */}
            <Box args={[3.2, 0.1, 2.2]} position={[0, 0.05, 0]}>
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.25}
                    metalness={0.8}
                    envMapIntensity={1.5}
                />
                <Edges threshold={15} color="#333" />
            </Box>

            {/* Screen Unit (Closed) */}
            <Box args={[3.2, 0.05, 2.2]} position={[0, 0.13, 0]}>
                <meshStandardMaterial color="#111" roughness={0.2} metalness={0.9} />
            </Box>

            {/* Bottom Vent Detail Area */}
            <group position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                {/* Vent Recess */}
                <Box args={[2.6, 1.6, 0.02]} position={[0, 0, 0.01]}>
                    <meshStandardMaterial color="#050505" roughness={0.8} />
                </Box>

                {/* Ventilation Grills - Precision Milled */}
                <group ref={ventRef}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <Box
                            key={i}
                            args={[2.5, 0.04, 0.04]}
                            position={[0, (i * 0.07) - 0.7, 0.02]}
                        >
                            <meshStandardMaterial
                                color="#222"
                                emissive="#00ffff"
                                emissiveIntensity={0.05}
                                metalness={0.8}
                            />
                        </Box>
                    ))}
                </group>

                {/* Target Highlight Grid - "Micro grid overlay" */}
                <group position={[0, 0, 0.05]}>
                    <Box args={[2.7, 1.7, 0.001]} ref={highlightRef}>
                        <meshBasicMaterial
                            color="#00ffff"
                            transparent
                            opacity={0}
                            wireframe
                            blending={THREE.AdditiveBlending}
                        />
                    </Box>
                </group>
            </group>

            {/* Premium Rubber Feet */}
            {[
                [1.4, 0.9], [-1.4, 0.9],
                [1.4, -0.9], [-1.4, -0.9]
            ].map((pos, i) => (
                <Circle
                    key={i}
                    args={[0.12, 32]}
                    position={[pos[0], -0.01, pos[1]]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <meshStandardMaterial color="#111" roughness={0.9} />
                </Circle>
            ))}
        </group>
    )
}
