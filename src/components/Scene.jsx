import { useRef, useLayoutEffect, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Environment, Sparkles, Stars, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Tape } from './Tape'
import { Laptop } from './Laptop'
import { Airflow } from './Airflow'
import { ParticleTape } from './ParticleTape'
import { FloatingDebris } from './FloatingDebris'

gsap.registerPlugin(ScrollTrigger)

export function Scene({ scrollContainer, selectedColor }) {
    const { camera, gl, viewport } = useThree()
    const tl = useRef()
    const tapeRef = useRef()
    const chromaticRef = useRef()
    const focusTarget = useRef(new THREE.Vector3(0, 0, 0))
    const mainStageRef = useRef()

    useFrame((state) => {
        // Subtle mouse parallax
        const x = (state.mouse.x * viewport.width) / 100
        const y = (state.mouse.y * viewport.height) / 100

        const parallaxTarget = new THREE.Vector3(
            focusTarget.current.x + x * 0.2,
            focusTarget.current.y + y * 0.2,
            focusTarget.current.z
        )

        camera.lookAt(parallaxTarget)
    })

    useLayoutEffect(() => {
        if (!scrollContainer.current) return

        tl.current = gsap.timeline({
            scrollTrigger: {
                trigger: scrollContainer.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity());
                    if (chromaticRef.current) {
                        const targetOffset = Math.min(velocity * 0.0002, 0.005)
                        chromaticRef.current.offset.x = THREE.MathUtils.lerp(chromaticRef.current.offset.x, targetOffset, 0.1);
                        chromaticRef.current.offset.y = THREE.MathUtils.lerp(chromaticRef.current.offset.y, targetOffset, 0.1);
                    }
                }
            }
        })

        // --- CAMERA ANIMATION SEQUENCE ---

        // Phase 1: Macro Hero
        tl.current.to(camera.position, { z: 4, y: 0.2, duration: 1 }, 0)
        tl.current.to(camera.position, { z: 2.5, x: 1, y: 0.8, duration: 1 }, 1)

        // Phase 2: Unroll / Texture Showcase
        tl.current.to(camera.position, { z: 5, x: -3, y: 1.5, duration: 1.5 }, 2)

        // Phase 3: Laptop Reveal
        tl.current.to(camera.position, { x: 0, y: -4, z: 3, duration: 1.5 }, 3.5)
        tl.current.to(focusTarget.current, { y: -2, duration: 1.5 }, 3.5)

        // Phase 4: Alignment Snap
        tl.current.to(camera.position, { y: -2.8, z: 1.5, duration: 1 }, 5)
        if (tapeRef.current) {
            tl.current.to(tapeRef.current.position, { x: 0.6, y: -2, z: 0, duration: 1.5 }, 5)
        }

        // The Application "Snap"
        if (tapeRef.current) {
            tl.current.to(tapeRef.current.position, { y: -2.065, duration: 0.2, ease: "bounce.out" }, 6.2)
        }

        // Shake on snap
        tl.current.to(camera.position, {
            y: "-=0.05",
            duration: 0.05,
            yoyo: true,
            repeat: 10,
            ease: "power2.inOut"
        }, 6.2)

        // Phase 5: Result / Reveal
        tl.current.to(camera.position, { x: 5, y: -0.5, z: 5, duration: 2 }, 7.2)
        tl.current.to(focusTarget.current, { y: -2, duration: 2 }, 7.2)

        // Phase 6: Transition to Anti-Gravity
        if (mainStageRef.current) {
            tl.current.to(mainStageRef.current.position, { y: 25, duration: 2, ease: "power2.in" }, 8.5)
        }

        tl.current.to(camera.position, { x: 0, y: -20, z: 8, duration: 2, ease: "power2.inOut" }, 8.5)
        tl.current.to(focusTarget.current, { x: 0, y: -20, z: 0, duration: 2, ease: "power2.inOut" }, 8.5)

        return () => {
            if (tl.current) tl.current.kill()
        }
    }, [])

    return (
        <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={200} scale={15} size={2} speed={0.4} opacity={0.4} color="#00BFFF" />
            <FloatingDebris />

            <group ref={mainStageRef}>
                <group ref={tapeRef}>
                    <Tape selectedColor={selectedColor} />
                </group>
                <group position={[0, -2, 0]}>
                    <Laptop />
                </group>
                <Airflow />
            </group>

            <ParticleTape position={[0, -20, 0]} count={15000} />

            <ambientLight intensity={0.5} />
            <pointLight position={[0, 8, 5]} intensity={80} color="#00BFFF" />
            <spotLight
                position={[0, 15, 0]}
                intensity={500}
                color="#ffffff"
                angle={0.3}
                penumbra={1}
                castShadow
            />

            <Environment preset="night" />

            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
                <ChromaticAberration offset={[0.002, 0.002]} ref={chromaticRef} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    )
}
