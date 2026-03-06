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
        borderRight: '2px solid #ffffff' // The "Flow" lead
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
        background: 'rgba(255, 255, 255, 0.08)', // Very subtle tape body
        borderTop: '1px solid rgba(255, 255, 255, 0.4)', // Tape Edge
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)', // Tape Edge
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
  const heroContentRef = useRef(null)
  const [hudData, setHudData] = useState({
    coords: "0.00, 0.00, 0.00",
    filterState: "99.2%",
    airflow: "100%",
    uptime: "00:00:00"
  })

  // Start Intro Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

      tl.from(".navbar-links span", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 1
      }, 0.5)

      tl.from(".hero-title-main", {
        y: 100,
        opacity: 0,
        duration: 2
      }, 0.8)

      tl.from(".hero-subtitle", {
        x: -20,
        opacity: 0,
        duration: 1
      }, 1.2)

      tl.from(".hero-bottom-content > *", {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1.5
      }, 1.5)

      tl.from(".hud-ui", {
        opacity: 0,
        stagger: 0.1,
        duration: 2
      }, 1.8)
    })
    return () => ctx.revert()
  }, [])

  // Simulate Live HUD Data
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setHudData(prev => ({
        ...prev,
        coords: `${(Math.random() * 10).toFixed(2)}, ${(Math.random() * 10).toFixed(2)}, ${(2.5 + Math.random() * 0.1).toFixed(2)}`,
        uptime: now.toLocaleTimeString('en-US', { hour12: false })
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])
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

      <div className="mesh-gradient"></div>
      <div className="cross-bg"></div>
      <div className="grain-overlay"></div>
      <div className="vignette-overlay"></div>

      {/* HUD ELEMENTS */}
      {/* MINIMAL STATUS UI */}
      <div className="hud-ui" style={{ top: '40px', left: '40px', textAlign: 'left', opacity: 0.6 }}>
        <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '4px', fontFamily: 'var(--font-main)', fontWeight: 700 }}>FERRO_WS</div>
        <span style={{ fontSize: '0.6rem' }}>{hudData.uptime} // {hudData.coords}</span>
      </div>

      <div className="hud-ui" style={{ bottom: '40px', right: '40px', textAlign: 'right', opacity: 0.6 }}>
        <div style={{ color: 'var(--color-accent)', fontSize: '0.7rem', marginBottom: '4px' }}>CORE_STATUS: ACTIVE</div>
        NETWORK: SECURE_LINK
      </div>

      <div ref={containerRef} className="ui-container" style={{ background: 'transparent' }}>

        {/* SCENE 1: HERO */}
        <section className="section hero" id="sec-1" style={{ position: 'relative', width: '100vw', height: '100vh', padding: '80px' }}>

          {/* Background Display Text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '35vw',
            fontWeight: '900',
            opacity: '0.02',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: -1,
            lineHeight: 1
          }}>
            0.1MM
          </div>

          {/* Top Navbar */}
          <div style={{ position: 'absolute', top: '50px', left: '80px', right: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="navbar-links">
              <span>PERFORMANCE</span>
              <span>SPECS</span>
              <span>INSTALL</span>
              <span>SHOP</span>
            </div>
            <div>
              <button className="cta-button" style={{ padding: '0.8rem 2rem' }}>Buy Now</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '15%', left: '80px', maxWidth: '1000px' }}>
            <div className="hero-subtitle">PRECISION FILTRATION PROTOCOL</div>
            <h1 className="hero-title-main" style={{ fontSize: '12vw', lineHeight: '0.8', marginBottom: '1rem' }}>
              FERRO<br />TAPE
            </h1>
          </div>

          <div className="hero-bottom-content" style={{ position: 'absolute', bottom: '15%', right: '80px', maxWidth: '380px', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '2px', background: 'var(--color-accent)', marginBottom: '1.5rem' }}></div>
            <p className="secondary-text" style={{ padding: 0, textTransform: 'none', letterSpacing: 'normal', fontFamily: 'var(--font-main)', color: '#fff', fontSize: '1.1rem', margin: 0 }}>
              The definitive dust filtration system for high-performance hardware. Engineered with a proprietary Nanoweave core.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '2.5rem' }}>
              <button className="cta-button primary" style={{ backgroundColor: 'var(--color-accent)', color: '#000', borderColor: 'var(--color-accent)' }}>
                PURCHASE
                <span className="add-icon" style={{ background: '#000', color: 'var(--color-accent)' }}>+</span>
              </button>
            </div>
          </div>
        </section>

        {/* SCENE 2: MACRO - FIBER */}
        <section className="section macro" id="sec-2">
          <div className="section-content left-align">
            <h2 style={{ fontSize: '6vw' }}>
              <MeshBuild triggerId="#sec-2">MATTE MESH FIBER</MeshBuild>
            </h2>
            <div style={{ maxWidth: '600px', marginTop: '1rem' }}>
              <TapeReveal triggerId="#sec-2" delay={0.2}>
                <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-accent)', fontFamily: 'var(--font-hud)', fontSize: '0.9rem' }}>
                  <span>/ HEAT-RESISTANT</span>
                  <span>/ BREATHABLE</span>
                  <span>/ DUST_BLOCKING</span>
                </div>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 3: UNROLL - NANO */}
        <section className="section unroll" id="sec-3">
          <div className="section-content center-align">
            <h2 style={{ fontSize: '5vw' }}>
              <MeshBuild triggerId="#sec-3">NANOWEAVE CORE</MeshBuild>
            </h2>
            <div style={{ marginTop: '1rem' }}>
              <TapeReveal triggerId="#sec-3" delay={0.2}>
                <p style={{ border: 'none', padding: 0, margin: '1rem 0', textAlign: 'center', maxWidth: '100%', textTransform: 'none', fontSize: '1rem' }}>
                  0.2MM PROPRIETARY MATRIX // 100-120°C RATED
                </p>
              </TapeReveal>
            </div>
          </div>
        </section>

        {/* SCENE 4: FEATURES - DUST & AIRFLOW */}
        <section className="section reveal" id="sec-4">
          <div className="section-content right-align">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '3vw', color: 'var(--color-accent)' }}>BLOCKS DUST</h2>
                <div style={{ marginTop: '1rem' }}>
                  <TapeReveal triggerId="#sec-4">
                    <p style={{ border: 'none', padding: 0, margin: 0, marginLeft: 'auto' }}>
                      Sub-micron particles captured before reaching your sensitive components.
                    </p>
                  </TapeReveal>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '3vw', color: 'var(--color-accent)' }}>MAINTAINS AIRFLOW</h2>
                <div style={{ marginTop: '1rem' }}>
                  <TapeReveal triggerId="#sec-4" delay={0.2}>
                    <p style={{ border: 'none', padding: 0, margin: 0 }}>
                      High-density weave ensures maximum thermal efficiency and low pressure drop.
                    </p>
                  </TapeReveal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 5: COLORS */}
        <section className="section apply" id="sec-5">
          <div className="section-content center-align">
            <h2 style={{ fontSize: '4rem', marginBottom: '3rem' }}>
              <MeshBuild triggerId="#sec-5">COLOR PALETTE</MeshBuild>
            </h2>
            <div style={{ display: 'flex', gap: '4rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="color-swatch" style={{ backgroundColor: '#111214' }}></div>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.7rem', color: 'var(--color-accent)' }}>#111214</span>
                <br />
                <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.9rem', fontWeight: '500' }}>MATTE BLACK</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="color-swatch" style={{ backgroundColor: '#6E737A' }}></div>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.7rem', color: 'var(--color-accent)' }}>#6E737A</span>
                <br />
                <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.9rem', fontWeight: '500' }}>SPACE GREY</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="color-swatch" style={{ backgroundColor: '#C7C9CC' }}></div>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.7rem', color: 'var(--color-accent)' }}>#C7C9CC</span>
                <br />
                <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.9rem', fontWeight: '500' }}>SILVER</span>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 6: SPECS */}
        <section className="section specs" id="sec-6">
          <div className="section-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>01 / MESH CORE</h3>
                <ul className="spec-list">
                  <li>High Density Woven Micro-mesh</li>
                  <li>Heat resistant up 100-120°C</li>
                  <li>Fine dust-blocking protocol</li>
                  <li>Sub-micron filtration</li>
                  <li>Thickness 0.4-0.6mm</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>02 / ADHESIVE BORDER</h3>
                <ul className="spec-list">
                  <li>3M-Grade Industrial Adhesion</li>
                  <li>Strong Removable Residue-free Strip</li>
                  <li>PET-Backed Pressure Sensitive</li>
                  <li>Ultra-Thin Profile 0.2-3mm</li>
                  <li>Precision Die-cut edges</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 7: FINISH & PACKAGING */}
        <section className="section finish" id="sec-7">
          <div className="section-content center-align">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', width: '100%' }}>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>03 / PREMIUM FINISH</h3>
                <p style={{ border: 'none', padding: 0, margin: 0, textTransform: 'none', textAlign: 'right', marginLeft: 'auto' }}>
                  Matte Black PET Border <br />
                  Optional: Debossed FERROTAPE branding <br />
                  Soft-Touch Industrial Coating
                </p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>04 / PACKAGING</h3>
                <p style={{ border: 'none', padding: 0, margin: 0, textTransform: 'none', textAlign: 'left' }}>
                  Matte Black Collector Box <br />
                  Gloss UV Print Typography <br />
                  Grey Recycled Foam Insert
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 8: FINAL */}
        <section className="section final" id="sec-8">
          <div className="section-content center-align">
            <h2 style={{ fontSize: '6vw', lineHeight: '0.9' }}>
              <MeshBuild triggerId="#sec-8">GAME SMARTER.</MeshBuild>
              <br />
              <MeshBuild triggerId="#sec-8" delay={0.2}><span style={{ color: 'var(--color-accent)' }}>FERROTAPE.</span></MeshBuild>
            </h2>
            <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
              <TapeReveal triggerId="#sec-8" delay={0.4}>
                <p style={{ border: 'none', padding: 0, margin: 0, textAlign: 'center', fontSize: '1.2rem', textTransform: 'none' }}>1 Meter Roll // Elite Protection System</p>
              </TapeReveal>
            </div>
            <button className="cta-button primary" style={{ backgroundColor: 'var(--color-accent)', color: '#000', padding: '1.5rem 4rem', fontSize: '1.2rem' }}>
              SHOP COLLECTION
            </button>
          </div>
        </section>
      </div>

      <Loader
        containerStyles={{ background: '#000' }}
        innerStyles={{ background: '#333', width: '200px' }}
        barStyles={{ background: '#ffffff', height: '5px' }}
        dataStyles={{ color: '#ffffff', fontFamily: 'Space Mono' }}
      />
    </>
  )
}

export default App
