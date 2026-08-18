import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/student/all_skills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.skills.length > 0) {
          setAllSkills(data.skills);
        }
      } catch (err) {
        console.error("Failed to load skills", err);
      }
    };
    fetchSkills();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    
    if (!selectedSkill || !minLevel) {
      setError("Please select both a skill and a minimum level requirement.");
      return;
    }
    
    try {
      const response = await fetch('/instructor/create_course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title, 
          description,
          skill_id: selectedSkill,
          min_level: minLevel
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMsg("Course created successfully!");
        setTimeout(() => {
          navigate('/instructor');
        }, 2500);
      } else {
        setError(data.error || "Failed to create course");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Create New Course</h1>
        <p>Author a new course for the SkillBridge catalog.</p>
      </div>

      <div style={{ maxWidth: '600px', backgroundColor: 'var(--course-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Course Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="e.g., Advanced React Patterns"
            />
          </div>
          
          <div className="form-group">
            <label>Course Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              rows="5"
              style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="What will students learn?"
            ></textarea>
          </div>
          <div className="form-group" style={{ marginTop: '24px' }}>
            <label>Primary Skill Requirement</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '200px' }}>
                <select 
                  value={selectedSkill} 
                  onChange={(e) => {
                    setSelectedSkill(e.target.value);
                    setError(null);
                  }}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem' }}
                >
                  <option value="" disabled>Select a skill...</option>
                  {allSkills.map(skill => (
                    <option key={skill.skill_id} value={skill.skill_id}>{skill.name} ({skill.category})</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '140px' }}>
                <select 
                  value={minLevel} 
                  onChange={(e) => {
                    setMinLevel(e.target.value);
                    setError(null);
                  }}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem' }}
                >
                  <option value="" disabled>Select a level...</option>
                  <option value="1">Level 1 - Beginner</option>
                  <option value="2">Level 2 - Basic</option>
                  <option value="3">Level 3 - Intermediate</option>
                  <option value="4">Level 4 - Advanced</option>
                  <option value="5">Level 5 - Expert</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button type="button" className="enroll-btn" style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--text-main)' }} onClick={() => navigate('/instructor')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" style={{ flex: 2 }}>
              Publish Course
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {successMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'var(--course-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', width: '400px', maxWidth: '90%', boxShadow: 'var(--shadow-xl)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Success!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {successMsg}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--sidebar-active-bg)', fontSize: '0.9rem', fontWeight: '500' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(56, 189, 248, 0.3)', borderTop: '2px solid var(--sidebar-active-bg)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Redirecting to Dashboard...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
