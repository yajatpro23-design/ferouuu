import { useRef, useLayoutEffect, useMemo } from 'react'
import { Cylinder, MeshTransmissionMaterial, Ring } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

export function Tape() {
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

        // GSAP Timeline synced to scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".ui-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5, // High scrub for ultra-smooth spline feel
            }
        })

        // --- SCENE 1: HERO IDLE (0-30%) ---
        // Just floating, handled by useFrame mostly.
        // But let's rotate the wrapper slightly to show off the roll.
        tl.to(wrap.rotation, { y: Math.PI, duration: 3, ease: "none" }, 0)

        // --- SCENE 2: TAPE UNFOLD (30-60%) ---
        // "Spline-based animation" simulation
        // 1. Move to "Pre-deployment" position
        tl.to(wrap.position, { x: 0, y: 1, z: 2, duration: 1.5, ease: "power2.inOut" }, 3)

        // 2. Unfold: Transform from Cylinder to Flat Strip
        // Rotate to align with length
        tl.to(wrap.rotation, { x: Math.PI / 2, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" }, 3)
        // Scale Y (length) up, Scale X/Z (radius) down to flatness
        tl.to(wrap.scale, { x: 4, y: 0.1, z: 2.2, duration: 1.5, ease: "power2.inOut" }, 3)

        // --- SCENE 3: ALIGNMENT (60-85%) ---
        // Glide to laptop vent position
        // Laptop vent is at roughly [0, -2.1, 0] (relative to world, since laptop is at [0, -2, 0])
        // Let's verify laptop position in Scene.jsx... it is at [0, -2, 0].
        // Vent is on bottom, so Y ~ -2.01.

        // Initial approach
        tl.to(wrap.position, { x: 0, y: -2.5, z: 0, duration: 1.5, ease: "power3.out" }, 6)

        // Precision alignment - "Magnetic precision"
        // Overshoot slightly then settle?
        // Hard to do overshoot with scrub, but we can do a calm ease.
        tl.to(wrap.rotation, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.out" }, 6)

        // Adjust scale to match vent perfectly
        tl.to(wrap.scale, { x: 3.5, y: 0.05, z: 2.0, duration: 1.5, ease: "power2.inOut" }, 6)

        // --- SCENE 4: APPLICATION (85%) ---
        // "Snap" / Contact
        // Move up to touch surface
        tl.to(wrap.position, { y: -2.08, duration: 0.5, ease: "expo.out" }, 8.5)

        // Material Ripple Trigger
        // We simulate ripple by animating material properties
        tl.to(mesh.material, {
            distortion: 2.0, // High distortion ripple
            chromaticAberration: 0.5, // Flash
            color: "#ffffff",
            duration: 0.2,
            yoyo: true,
            repeat: 1
        }, 8.5)

        // Settle to final clean state
        tl.to(mesh.material, {
            distortion: 0,
            chromaticAberration: 0.02,
            roughness: 0.1,
            color: "#00ffff", // Final brand color
            duration: 1.5
        }, 8.8)

        // --- SCENE 5: CONFIRMATION (85-100%) ---
        // Locked in place.
        // Maybe slight scale out to "seal" edges
        tl.to(wrap.scale, { x: 3.6, z: 2.1, duration: 1 }, 9)

        return () => {
            if (tl.current) tl.current.kill()
        }
    }, [])

    return (
        <group ref={wrapperRef}>
            <group ref={innerRef}>
                {/* Main Tape Mesh */}
                <Cylinder args={[1, 1, 1, 64]} ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
                    <MeshTransmissionMaterial
                        backside
                        samples={10} // Higher quality
                        resolution={1024} // Crisper reflections
                        thickness={0.05}
                        roughness={0.2}
                        anisotropy={0.5}
                        chromaticAberration={0.06}
                        color="#aaffff"
                        emissive="#000000"
                        transmission={0.98}
                        distortion={0.2}
                        distortionScale={0.5}
                        temporalDistortion={0.0} // Keep static until ripple
                        ior={1.5}
                        attenuationDistance={1}
                        attenuationColor="#ffffff"
                    />
                </Cylinder>

                {/* Holographic Edge Highlight (Fade in on unfold?) */}
                <Cylinder args={[1.01, 1.01, 1, 64]} rotation={[0, 0, Math.PI / 2]}>
                    <meshBasicMaterial
                        color="#00ffff"
                        wireframe
                        transparent
                        opacity={0.05}
                        blending={THREE.AdditiveBlending}
                    />
                </Cylinder>
            </group>
        </group>
    )
}
