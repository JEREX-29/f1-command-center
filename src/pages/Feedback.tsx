import { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function Feedback() {
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setMessage('');
    setEmail('');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <MessageSquare size={40} style={{ color: 'var(--accent-blue)', marginBottom: 12 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Send Us Feedback</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
          Help us improve the Formula 1 Dashboard. Share your thoughts, report bugs, or suggest new features.
        </p>
      </div>

      {submitted && (
        <div className="card" style={{ 
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', gap: 10, padding: 16
        }}>
          <CheckCircle size={20} style={{ color: 'var(--accent-green)' }} />
          <span style={{ color: 'var(--accent-green)', fontWeight: 500 }}>Thank you! Your feedback has been received.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
              Category
            </label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="select-control" style={{ width: '100%', padding: '10px 14px' }}>
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="data">Data Issue</option>
              <option value="ui">UI/UX Improvement</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
              Email (optional)
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
              Message
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={6}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', resize: 'vertical', minHeight: 120 }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}>
            <Send size={14} /> Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
