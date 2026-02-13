import { useRef, useLayoutEffect, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Environment, Float, Sparkles, PerspectiveCamera, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Tape } from './Tape'
import { Laptop } from './Laptop'
import { Dust } from './Dust'
import { Airflow } from './Airflow'
import { ParticleTape } from './ParticleTape'

gsap.registerPlugin(ScrollTrigger)

export function Scene({ scrollContainer }) {
    const { camera, gl, viewport, mouse } = useThree()
    const tl = useRef()
    const chromaticRef = useRef()
    // Create a target vector for the camera to look at
    const focusTarget = useRef(new THREE.Vector3(0, 0, 0))
    const mainStageRef = useRef()

    useFrame((state) => {
        // Look at the animated focus target
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
        ScrollTrigger.refresh()

        tl.current = gsap.timeline({
            scrollTrigger: {
                trigger: ".ui-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity());
                    if (chromaticRef.current) {
                        const targetOffset = Math.min(velocity * 0.0002, 0.01)
                        chromaticRef.current.offset.x = THREE.MathUtils.lerp(chromaticRef.current.offset.x, targetOffset, 0.1);
                        chromaticRef.current.offset.y = THREE.MathUtils.lerp(chromaticRef.current.offset.y, targetOffset, 0.1);
                    }
                }
            }
        })

        // --- TIMELINE ---

        // 0-10: Hero
        tl.current.to(camera.position, { z: 4, y: 0.2, duration: 1 }, 0)

        // 10-20: Macro
        tl.current.to(camera.position, { z: 2, x: 1, y: 0.5, duration: 1 }, 1)

        // 20-35: Unroll
        tl.current.to(camera.position, { z: 5, x: -3, y: 2, duration: 1.5 }, 2)

        // 35-50: Laptop Reveal
        tl.current.to(camera.position, { x: 0, y: -4.5, z: 2.5, duration: 1.5 }, 3.5)
        tl.current.to(focusTarget.current, { y: -2, duration: 1.5 }, 3.5)

        // 50-60: Align
        tl.current.to(camera.position, { y: -2.8, z: 1.2, duration: 2 }, 5)

        // 60-72: Snap
        tl.current.to(camera.position, {
            y: -2.7,
            duration: 0.1,
            yoyo: true,
            repeat: 5,
            ease: "power1.inOut"
        }, 6.5)

        // 72-88: Dust/Airflow
        tl.current.to(camera.position, { x: 4, y: -1, z: 4, duration: 2 }, 7.2)
        tl.current.to(focusTarget.current, { y: -2, duration: 2 }, 7.2)

        // 88+: TRANSITION - Move Main Stage UP
        if (mainStageRef.current) {
            tl.current.to(mainStageRef.current.position, { y: 20, duration: 1.5 }, 8.0)
        }

        // 88-100: Final Hero (Particle Tape)
        // Camera moves to Particle Stage at y: -20
        tl.current.to(camera.position, { x: 0, y: -20, z: 6, duration: 1.5, ease: "power2.inOut" }, 8.5)
        tl.current.to(focusTarget.current, { x: 0, y: -20, z: 0, duration: 1.5, ease: "power2.inOut" }, 8.5)

        return () => {
            if (tl.current) tl.current.kill()
        }
    }, [])

    return (
        <>
            <color attach="background" args={['#020202']} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <group name="content">
                {/* Main Stage: Contains Physical Tape, Laptop, Dust lines */}
                <group ref={mainStageRef}>
                    <Tape />
                    <group position={[0, -2, 0]} name="laptop-group">
                        <Laptop />
                    </group>
                    <Dust count={2000} />
                    <Airflow />
                </group>

                {/* Final Stage: Particle Tape (Evolved) */}
                <ParticleTape position={[0, -20, 0]} />
            </group>

            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 10, 5]} intensity={4} color="#ccffff" castShadow />
            <spotLight position={[-10, 0, -5]} intensity={15} color="#00ffff" angle={0.5} penumbra={1} />
            <spotLight position={[10, -5, 5]} intensity={8} color="#ff00ff" angle={0.6} penumbra={0.5} />

            <Environment preset="city" blur={0.6} background={false} />

            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} intensity={1.5} radius={0.8} mipmapBlur />
                <Noise opacity={0.15} />
                <Vignette eskil={false} offset={0.05} darkness={1.2} />
                <ChromaticAberration
                    ref={chromaticRef}
                    blendFunction={BlendFunction.NORMAL}
                    offset={[0.002, 0.002]}
                />
            </EffectComposer>
        </>
    )
}
