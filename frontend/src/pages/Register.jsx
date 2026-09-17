import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // New States for Skills
  const [availableSkills, setAvailableSkills] = useState([]);
  const [addedSkills, setAddedSkills] = useState([]); // [{ skill_id, skill_name, level }]
  const [currentSkillId, setCurrentSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [currentLevel, setCurrentLevel] = useState('3');

  const navigate = useNavigate();

  // Fetch skills on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/auth/skills')
      .then(res => res.json())
      .then(data => setAvailableSkills(data))
      .catch(err => console.error("Error fetching skills:", err));
  }, []);

  const handleAddSkill = () => {
    if (!currentSkillId) return;
    if (currentSkillId === 'other' && !customSkillName.trim()) return;

    const skillName = currentSkillId === 'other' 
      ? customSkillName.trim() 
      : availableSkills.find(s => s.skill_id === currentSkillId)?.name;

    // Check if already added
    if (addedSkills.some(s => s.skill_id === currentSkillId && currentSkillId !== 'other')) return;
    if (currentSkillId === 'other' && addedSkills.some(s => s.skill_name.toLowerCase() === customSkillName.trim().toLowerCase())) return;

    setAddedSkills([...addedSkills, {
      skill_id: currentSkillId,
      skill_name: skillName,
      level: parseInt(currentLevel)
    }]);

    // Reset
    setCurrentSkillId('');
    setCustomSkillName('');
    setCurrentLevel('3');
  };

  const handleRemoveSkill = (index) => {
    setAddedSkills(addedSkills.filter((_, i) => i !== index));
  };

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!/^[a-zA-Z]/.test(username)) {
      setError("Name must start with a letter");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters and contain uppercase, lowercase, numbers, and symbols.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role, skills: addedSkills })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Automatically redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.detail || data.error || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="login-page-wrapper">
      
      <div className="login-hero">
        <h1>Start your journey<br/>with SkillBridge.</h1>
        <p>Join as a Student to master new skills, or as an Instructor to author precision-matched courses.</p>
      </div>

      <div className="login-form-section" style={{ overflowY: 'auto' }}>
        <div className="login-container" style={{ margin: 'auto' }}>
          <h2>Create an account</h2>
          <p className="subtitle">Enter your details to get started.</p>
          
          {error && (
            <div className="error-msg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '0.875rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '0.062rem solid #bbf7d0', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '500' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Account Type</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Email address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Password</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Min 8 chars"
                  />
                  <button 
                    type="button" 
                    className="eye-icon" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="Repeat"
                  />
                  <button 
                    type="button" 
                    className="eye-icon" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Selection Section - ONLY FOR STUDENTS */}
            {role === 'student' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Add Your Current Skills (Optional)</label>
                
                {/* Modern Skill Adder Card (Compact) */}
                <div style={{ 
                  border: '1px solid var(--border-color)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '0.75rem', 
                  marginTop: '0.25rem',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {/* Skill Selection Row */}
                    <div>
                      <div style={{ position: 'relative' }}>
                        <select 
                          value={currentSkillId} 
                          onChange={(e) => setCurrentSkillId(e.target.value)}
                          style={{ width: '100%', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="">Choose a skill...</option>
                          {availableSkills.map(s => (
                            <option key={s.skill_id} value={s.skill_id}>{s.name}</option>
                          ))}
                          <option value="other" style={{ fontWeight: 'bold' }}>+ Add Custom Skill...</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Skill Input */}
                    {currentSkillId === 'other' && (
                      <div>
                        <input 
                          type="text" 
                          placeholder="e.g. Graphic Design"
                          value={customSkillName}
                          onChange={(e) => setCustomSkillName(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                      </div>
                    )}

                    {/* Level and Add Button on ONE line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', margin: 0 }}>LEVEL: <span style={{ color: 'var(--sidebar-active-bg)', fontWeight: '600' }}>
                            {currentLevel === '1' ? 'Beginner' : 
                             currentLevel === '2' ? 'Novice' : 
                             currentLevel === '3' ? 'Intermediate' : 
                             currentLevel === '4' ? 'Advanced' : 'Expert'}
                          </span></label>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <div 
                              key={lvl}
                              onClick={() => setCurrentLevel(lvl.toString())}
                              style={{
                                flex: 1,
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: parseInt(currentLevel) >= lvl ? 'var(--sidebar-active-bg)' : 'var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: parseInt(currentLevel) >= lvl ? '0 0 8px rgba(14, 165, 233, 0.4)' : 'none'
                              }}
                              title={`Level ${lvl}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Add Button */}
                      <button 
                        type="button" 
                        onClick={handleAddSkill}
                        disabled={!currentSkillId || (currentSkillId === 'other' && !customSkillName.trim())}
                        style={{ 
                          width: '90px', 
                          padding: '0.6rem', 
                          backgroundColor: (!currentSkillId || (currentSkillId === 'other' && !customSkillName.trim())) ? 'var(--border-color)' : 'var(--sidebar-active-bg)', 
                          color: (!currentSkillId || (currentSkillId === 'other' && !customSkillName.trim())) ? 'var(--text-muted)' : '#fff', 
                          border: 'none', 
                          borderRadius: '0.5rem', 
                          cursor: (!currentSkillId || (currentSkillId === 'other' && !customSkillName.trim())) ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          marginTop: '0.5rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Added Skills Chips */}
                {addedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {addedSkills.map((sk, index) => (
                      <div key={index} style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        backgroundColor: 'transparent', 
                        border: '1px solid var(--sidebar-active-bg)',
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '1.5rem', 
                      }}>
                        <span style={{ fontWeight: '500', fontSize: '0.8rem' }}>{sk.skill_name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                           {[1,2,3,4,5].map(l => (
                             <div key={l} style={{ width: '4px', height: '10px', borderRadius: '2px', backgroundColor: l <= sk.level ? 'var(--sidebar-active-bg)' : 'var(--border-color)' }} />
                           ))}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(index)} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', marginLeft: '0.25rem' }}
                          title="Remove skill"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--sidebar-active-bg)', fontWeight: '600' }}>Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
