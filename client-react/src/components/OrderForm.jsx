import { useState } from 'react';

export default function OrderForm({ artists }) {
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '',
    tattooStyle: 'Traditional', placement: 'Forearm', size: 'Medium (3-5 in)',
    description: '', budget: '₹5,000 - ₹10,000', preferredArtist: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/public/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: `✅ ${result.message}` });
        setForm({
          clientName: '', clientEmail: '', clientPhone: '',
          tattooStyle: 'Traditional', placement: 'Forearm', size: 'Medium (3-5 in)',
          description: '', budget: '₹5,000 - ₹10,000', preferredArtist: ''
        });
      } else {
        setMessage({ type: 'error', text: `❌ ${result.message || 'Submission failed'}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="r-section r-bg-alt" id="order-form">
      <div className="r-container">
        <div className="r-form-card-wrap">
          <div className="r-section-header" style={{ marginBottom: 28 }}>
            <div className="r-subheading">START YOUR PROJECT</div>
            <h2 className="r-heading">Book A Custom Consultation</h2>
            <p className="r-desc">Tell us your tattoo vision and our resident artists will get back to you within 24 hours.</p>
          </div>

          {message && (
            <div className={`r-form-alert ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="r-pub-form">
            <div className="r-pub-form-grid">
              <div className="r-pub-group">
                <label className="r-pub-label">Your Name *</label>
                <input type="text" className="r-pub-input" placeholder="Aarav Sharma" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required />
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Email Address *</label>
                <input type="email" className="r-pub-input" placeholder="aarav@gmail.com" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} required />
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Phone / WhatsApp</label>
                <input type="tel" className="r-pub-input" placeholder="+91 98765 43210" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} />
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Tattoo Style</label>
                <select className="r-pub-input" value={form.tattooStyle} onChange={e => setForm({ ...form, tattooStyle: e.target.value })}>
                  <option>Traditional</option><option>Neo-Traditional</option><option>Minimalist</option>
                  <option>Geometric</option><option>Watercolor</option><option>Blackwork</option>
                  <option>Realism</option><option>Japanese</option><option>Fine Line</option>
                </select>
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Placement Body Part</label>
                <select className="r-pub-input" value={form.placement} onChange={e => setForm({ ...form, placement: e.target.value })}>
                  <option>Forearm</option><option>Bicep / Shoulder</option><option>Chest / Ribs</option>
                  <option>Back</option><option>Calf / Leg</option><option>Wrist / Ankle</option><option>Neck</option>
                </select>
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Size Category</label>
                <select className="r-pub-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                  <option>Small (Under 3 in)</option><option>Medium (3-5 in)</option>
                  <option>Large (6-10 in)</option><option>Half Sleeve</option><option>Full Sleeve / Backpiece</option>
                </select>
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Target Budget</label>
                <select className="r-pub-input" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}>
                  <option>Under ₹5,000</option><option>₹5,000 - ₹10,000</option><option>₹10,000 - ₹25,000</option><option>₹25,000+</option>
                </select>
              </div>
              <div className="r-pub-group">
                <label className="r-pub-label">Preferred Artist (Optional)</label>
                <select className="r-pub-input" value={form.preferredArtist} onChange={e => setForm({ ...form, preferredArtist: e.target.value })}>
                  <option value="">No preference — Assign best artist</option>
                  {(artists || []).map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div className="r-pub-group" style={{ marginTop: 14 }}>
              <label className="r-pub-label">Describe Your Design Idea *</label>
              <textarea className="r-pub-input" rows={4} placeholder="Describe the elements, meaning, reference ideas, or inspiration..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <button type="submit" className="r-pub-submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Consultation Request →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
