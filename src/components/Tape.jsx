import { useRef, useLayoutEffect, useMemo } from 'react'
import { Cylinder, MeshTransmissionMaterial, Ring } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export function Tape({ selectedColor = '#111214' }) {
    const wrapperRef = useRef() // Controls Macro Movement (Scroll)
    const innerRef = useRef()   // Controls Micro Movement (Breathing)
    const meshRef = useRef()    // Controls Material/Shape

    // Smooth dampening for breathing
    useFrame((state) => {
        if (!innerRef.current) return
        const t = state.clock.getElapsedTime()

        // Micro-breathing: gentle float
        innerRef.current.position.y = Math.sin(t * 1.5) * 0.05
        innerRef.current.rotation.z = Math.cos(t * 1) * 0.02
        innerRef.current.rotation.x = Math.sin(t * 0.8) * 0.02
    })

    useLayoutEffect(() => {
        const wrap = wrapperRef.current
        const mesh = meshRef.current

        if (!wrap || !mesh) return

        // Sync mesh color to prop, but allow GSAP to override if needed
        if (mesh.material) {
            mesh.material.color.set(selectedColor)
        }

        // GSAP Timeline synced to scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".ui-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
            }
        })

        // --- SCENE 1: HERO IDLE (0-30%) ---
        tl.to(wrap.rotation, { y: Math.PI * 2, duration: 3, ease: "power1.inOut" }, 0)

        // --- SCENE 2: TAPE UNFOLD (30-60%) ---
        tl.to(wrap.position, { x: 0, y: 1, z: 2, duration: 1.5, ease: "power2.inOut" }, 3)
        tl.to(wrap.rotation, { x: Math.PI / 2, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" }, 3)
        tl.to(wrap.scale, { x: 4, y: 0.1, z: 2.5, duration: 1.5, ease: "power2.inOut" }, 3)

        // --- SCENE 3: ALIGNMENT (60-85%) ---
        tl.to(wrap.position, { x: 0, y: -2.5, z: 0, duration: 1.5, ease: "power3.out" }, 6)
        tl.to(wrap.rotation, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.out" }, 6)
        tl.to(wrap.scale, { x: 3.5, y: 0.05, z: 2.2, duration: 1.5, ease: "power2.inOut" }, 6)

        // --- SCENE 4: APPLICATION (85%) ---
        tl.to(wrap.position, { y: -2.08, duration: 0.5, ease: "expo.out" }, 8.5)

        // Settle to final clean state
        tl.to(mesh.material, {
            roughness: 0.3,
            metalness: 0.7,
            duration: 1.5
        }, 8.8)

        tl.to(wrap.scale, { x: 3.6, z: 2.3, duration: 1 }, 9)

        return () => {
            if (tl) tl.kill()
        }
    }, [selectedColor])

    return (
        <group ref={wrapperRef}>
            <group ref={innerRef}>
                {/* Main Tape Volume - Glassy / Translucent */}
                <Cylinder args={[1, 1, 1, 64]} ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
                    <meshPhysicalMaterial
                        roughness={0.05}
                        metalness={0}
                        transmission={0.9}
                        ior={1.5}
                        thickness={0.2}
                        color="#ffffff"
                        emissive={selectedColor}
                        emissiveIntensity={1.5}
                        transparent
                    />
                </Cylinder>

                {/* THE NANO-MESH (Technical Grid Layer) - Matching Video */}
                <Cylinder args={[1.002, 1.002, 1.01, 128, 64]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial
                        color="#ffffff"
                        wireframe
                        transparent
                        opacity={0.3}
                        blending={THREE.AdditiveBlending}
                        emissive="#00BFFF"
                        emissiveIntensity={1.5}
                    />
                </Cylinder>

                {/* Internal Structural Glow (The 'Power' Core) */}
                <Cylinder args={[0.92, 0.92, 1, 64]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#ffffff"
                        emissiveIntensity={15}
                        transparent
                        opacity={0.4}
                    />
                </Cylinder>
            </group>
        </group>
    )
}
