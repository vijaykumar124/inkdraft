export default function Process() {
  const steps = [
    { num: '01', title: 'Consultation & Idea', desc: 'Discuss placement, sizing, symbolism, and aesthetic vision with our expert design team.' },
    { num: '02', title: 'Bespoke Custom Draft', desc: 'Our artist renders a high-definition 1-of-1 digital draft tailored precisely to your body contour.' },
    { num: '03', title: 'Precision Inking', desc: 'Applied in a 100% sterile studio environment using medical-grade equipment and organic pigments.' },
    { num: '04', title: 'Aftercare & Guarantee', desc: 'Receive medical aftercare products and a lifetime touch-up guarantee for your tattoo.' }
  ];

  return (
    <section className="r-section r-bg-alt" id="process">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">HOW IT WORKS</div>
          <h2 className="r-heading">The InkDraft Experience</h2>
          <p className="r-desc">A seamless 4-step journey from your initial sketch to permanent wearable art.</p>
        </div>

        <div className="r-process-grid">
          {steps.map(s => (
            <div key={s.num} className="r-process-card">
              <div className="r-process-num">{s.num}</div>
              <h3 className="r-process-title">{s.title}</h3>
              <p className="r-process-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
