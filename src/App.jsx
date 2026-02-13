import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene } from './components/Scene'
import { Loader } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

// --- BRAND-SPECIFIC TEXT ANIMATIONS ---

// 1. MESH BUILD: Simulates the mesh structure filling with adhesive
// Text starts as a hollow "wireframe" (the mesh) and fills with solid color
function MeshBuild({ children, triggerId, delay = 0, className = "" }) {
  const containerRef = useRef()
  const fillRef = useRef()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Reset state
      gsap.set(fillRef.current, { width: "0%" })

      // Animate the "Fill" (Adhesive) spreading through the "Mesh" (Outline)
      gsap.to(fillRef.current, {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut",
        delay: delay,
        scrollTrigger: {
          trigger: triggerId,
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        }
      })
    }, containerRef)
    return () => ctx.revert()
  }, [triggerId, delay])

  return (
    <div ref={containerRef} className={`mesh-build-container ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      {/* The Wired Mesh Layer (Always Visible Outline) */}
      <span className="mesh-outline" style={{
        WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
        color: 'transparent',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </span>

      {/* The Solid Fill Layer (Clipped) */}
      <div ref={fillRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        zIndex: 2,
        borderRight: '2px solid #00ffff' // The "Flow" lead
      }}>
        <span style={{ color: '#fff' }}>
          {children}
        </span>
      </div>
    </div>
  )
}

// 2. TAPE STRIP REVEAL: Simulates a strip of tape being laid down
// A masking div unrolls, revealing the text underneath
function TapeReveal({ children, triggerId, delay = 0 }) {
  const containerRef = useRef()
  const maskRef = useRef()
  const textRef = useRef()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial State
      // Mask (The Tape) starts width 0
      gsap.set(maskRef.current, { width: 0 })
      // Text starts hidden
      gsap.set(textRef.current, { opacity: 0, x: -10 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerId,
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        },
        delay: delay
      })

      // 1. The Tape Strip shoots across (Unrolls)
      tl.to(maskRef.current, {
        width: "100%",
        duration: 0.8,
        ease: "power2.out"
      })

      // 2. Text appears "printed" on the tape as it unrolls
      tl.to(textRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.6")

    }, containerRef)
    return () => ctx.revert()
  }, [triggerId, delay])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', padding: '0.2em 1em', overflow: 'visible' }}>
      {/* The Tape Background Strip */}
      <div ref={maskRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        background: 'rgba(0, 255, 255, 0.08)', // Very subtle tape body
        borderTop: '1px solid rgba(0, 255, 255, 0.4)', // Tape Edge
        borderBottom: '1px solid rgba(0, 255, 255, 0.4)', // Tape Edge
        zIndex: 0,
        backdropFilter: 'blur(2px)' // Distortion effect
      }}></div>

      {/* The Text Content */}
      <div ref={textRef} style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

function App() {
  const containerRef = useRef(null)

  return (
    <>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene scrollContainer={containerRef} />
          </Suspense>
        </Canvas>
      </div>

      <div className="grain-overlay"></div>
      <div className="vignette-overlay"></div>

      {/* HUD ELEMENTS */}
      <div className="hud-ui" style={{ top: '20px', left: '20px', textAlign: 'left' }}>
        SYSTEM: ONLINE<br />
        V.2.0.4<br />
        FERRO_CORE_ACTIVE
      </div>
      <div className="hud-ui" style={{ bottom: '20px', right: '20px' }}>
        <span className="blinking-cursor">_</span>SCROLL_DETECTED
      </div>

      <div ref={containerRef} className="ui-container">

        {/* SCENE 1: HERO */}
        <section className="section hero" id="sec-1">
          <div className="section-content">
            {/* The Main Title doesn't use the MeshBuild as it's the brand logo efficiently */}
            <h1 className="glitch-title" data-text="FERROO TAPE">FERROO TAPE</h1>
            <div className="subtitle-box">
              <TapeReveal triggerId="#sec-1" delay={0.5}>
                SYSTEM INTEGRITY: <span style={{ color: '#00ffff' }}>MAXIMUM</span>
              </TapeReveal>
              <br />
              <TapeReveal triggerId="#sec-1" delay={0.8}>
                DEFEND YOUR HARDWARE.
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 2: MACRO */}
        <section className="section macro" id="sec-2">
          <div className="section-content left-align">
            <h2>
              <MeshBuild triggerId="#sec-2">NANOWEAVE ARCHITECTURE</MeshBuild>
            </h2>
            <div style={{ maxWidth: '600px' }}>
              <TapeReveal triggerId="#sec-2" delay={0.2}>
                <p style={{ border: 'none', padding: 0, margin: 0 }}>
                  0.2MM PROPRIETARY MATRIX // <br />
                  SUB-MICRON FILTRATION PROTOCOL.
                </p>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 3: UNROLL */}
        <section className="section unroll" id="sec-3">
          <div className="section-content center-align">
            <h2 style={{ opacity: 0.8, fontSize: '2rem' }}>
              <MeshBuild triggerId="#sec-3">DEPLOYMENT SEQUENCE</MeshBuild>
            </h2>
          </div>
        </section>

        {/* SCENE 4: REVEAL */}
        <section className="section reveal" id="sec-4">
          <div className="section-content right-align">
            <h2>
              <MeshBuild triggerId="#sec-4">INTAKE VULNERABILITY</MeshBuild>
            </h2>
            <div style={{ marginLeft: 'auto', maxWidth: '500px' }}>
              <TapeReveal triggerId="#sec-4" delay={0.2}>
                <p style={{ border: 'none', padding: 0, margin: 0 }}>
                  TARGET: BOTTOM VENT ARRAY. <br />
                  STATUS: UNPROTECTED.
                </p>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 6: SNAP */}
        <section className="section apply" id="sec-6">
          <div className="section-content center-align">
            <h2 className="big-impact">
              <MeshBuild triggerId="#sec-6">ZERO-GAP ADHESION</MeshBuild>
            </h2>
            <div style={{ minWidth: '400px' }}>
              <TapeReveal triggerId="#sec-6" delay={0.3}>
                <p style={{ border: 'none', padding: 0, margin: 0, textAlign: 'center' }}>INSTANT INTERFACE ESTABLISHED</p>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 7: SIMULATION */}
        <section className="section simulation" id="sec-7">
          <div className="section-content left-align">
            <h2>
              <MeshBuild triggerId="#sec-7">PARTICLE REJECTION</MeshBuild>
            </h2>
            <div style={{ maxWidth: '600px' }}>
              <TapeReveal triggerId="#sec-7" delay={0.2}>
                <p style={{ border: 'none', padding: 0, margin: 0 }}>
                  DUST: NULLIFIED. <br />
                  AIRFLOW: 99.8% EFFICIENCY.
                </p>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 8: FINAL */}
        <section className="section final" id="sec-8">
          <div className="section-content center-align">
            <h2 style={{ fontSize: '5rem', lineHeight: '0.9' }}>
              <MeshBuild triggerId="#sec-8">YOUR HARDWARE.</MeshBuild>
              <br />
              <MeshBuild triggerId="#sec-8" delay={0.2}><span style={{ color: '#00ffff' }}>EVOLVED.</span></MeshBuild>
            </h2>
            <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
              <TapeReveal triggerId="#sec-8" delay={0.4}>
                <p style={{ border: 'none', padding: 0, margin: 0, textAlign: 'center' }}>FERROO TAPE // THE APEX BARRIER</p>
              </TapeReveal>
            </div>
            <button className="cta-button">ACQUIRE SYSTEM</button>
          </div>
        </section>
      </div>

      <Loader
        containerStyles={{ background: '#000' }}
        innerStyles={{ background: '#333', width: '200px' }}
        barStyles={{ background: '#00ffff', height: '5px' }}
        dataStyles={{ color: '#00ffff', fontFamily: 'Space Mono' }}
      />
    </>
  )
}

export default App
