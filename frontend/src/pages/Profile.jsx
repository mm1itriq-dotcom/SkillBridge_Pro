import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [skillSuccessMessage, setSkillSuccessMessage] = useState('');
  const [skillFormError, setSkillFormError] = useState('');
  const [skillToDelete, setSkillToDelete] = useState(null);
  
  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    
    if (newUsername && !/^[a-zA-Z]/.test(newUsername)) {
      setProfileError("Username must start with a letter");
      return;
    }
    
    if (newPassword) {
      if (!oldPassword) {
        setProfileError("You must provide your current password to set a new password.");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setProfileError("Password must be at least 8 characters and contain uppercase, lowercase, numbers, and symbols.");
        return;
      }
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/auth/update_profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUsername || undefined,
          old_password: oldPassword || undefined,
          new_password: newPassword || undefined
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfileSuccessMessage(data.message);
        // Force re-login to refresh the token with the new username
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 3500);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setProfileError("Network error updating profile");
    }
  };

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username || 'User');
      setEmail(payload.email || '');
      setRole(payload.role || '');

      // Fetch my skills
      const mySkillsRes = await fetch('/student/skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mySkillsData = await mySkillsRes.json();
      
      // Fetch all available skills
      const allSkillsRes = await fetch('/student/all_skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allSkillsData = await allSkillsRes.json();

      if (mySkillsRes.ok && allSkillsRes.ok) {
        setMySkills(mySkillsData.my_skills || []);
        setAllSkills(allSkillsData.skills || []);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    setSkillFormError('');
    
    if (!selectedSkill || !selectedLevel) {
      setSkillFormError("Please select both a skill and a proficiency level.");
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/student/update_skill', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skill_id: selectedSkill,
          new_level: parseInt(selectedLevel)
        })
      });
      
      if (res.ok) {
        setSkillSuccessMessage("Skill updated successfully!");
        setTimeout(() => setSkillSuccessMessage(''), 3000);
        // Reset selections after success
        setSelectedSkill('');
        setSelectedLevel('');
        fetchProfileData(); // Refresh the skills list
      } else {
        setSkillFormError("Failed to update skill");
      }
    } catch (err) {
      setSkillFormError("Network error updating skill");
    }
  };

  const confirmRemoveSkill = async () => {
    if (!skillToDelete) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/student/skill/${skillToDelete.skill_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setSkillSuccessMessage(`"${skillToDelete.skill}" removed successfully!`);
        setTimeout(() => setSkillSuccessMessage(''), 3000);
        setSkillToDelete(null);
        fetchProfileData(); // Refresh the skills list
      } else {
        alert("Failed to remove skill");
      }
    } catch (err) {
      alert("Network error removing skill");
    }
  };

  if (loading) return <div className="page-loader">Loading profile...</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>My Profile</h1>
        <p>Manage your account details and update your skill levels to improve your course matches.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* User Details Card */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'var(--course-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Account Details</h2>
            {!isEditingProfile && (
              <button 
                onClick={() => {
                  setNewUsername(username);
                  setOldPassword('');
                  setNewPassword('');
                  setProfileError('');
                  setIsEditingProfile(true);
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--sidebar-active-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Edit Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
            )}
          </div>
          
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile}>
              {profileError && <div className="error-msg" style={{ marginBottom: '16px', padding: '8px', fontSize: '0.9rem' }}>{profileError}</div>}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem' }}>New Username</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  placeholder="Must start with a letter"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem' }}>Current Password (Required to change password)</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  placeholder="Enter current password"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Leave blank to keep current"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ flex: 1, padding: '10px' }}>Save Changes</button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Username</label>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{username}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</label>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{email}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Account Role</label>
                <div style={{ display: 'inline-block', backgroundColor: 'var(--badge-bg)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize', border: '1px solid var(--border-color)' }}>
                  {role}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Skill Management Card (Students Only) */}
        {role !== 'instructor' && (
          <div style={{ flex: '2', minWidth: '300px', backgroundColor: 'var(--course-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>My Skill Profile</h2>
            
            <div style={{ marginBottom: '32px' }}>
              {mySkills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You haven't added any skills yet. Add some below to see your match scores!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {mySkills.map(s => (
                    <div key={s.skill_id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                      <span style={{ fontWeight: '600', marginRight: '8px' }}>{s.skill}</span>
                      <span style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '99px', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '8px' }}>Lvl {s.level}</span>
                      <button 
                        onClick={() => setSkillToDelete(s)} 
                        title="Remove skill"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Add or Update a Skill</h3>
                {skillSuccessMessage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '500', fontSize: '0.9rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '99px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    {skillSuccessMessage}
                  </div>
                )}
                {skillFormError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '500', fontSize: '0.9rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '99px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {skillFormError}
                  </div>
                )}
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <form onSubmit={handleUpdateSkill} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '2', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Skill</label>
                    <select 
                      value={selectedSkill} 
                      onChange={(e) => {
                        setSelectedSkill(e.target.value);
                        setSkillFormError('');
                      }}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--course-bg)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    >
                      <option value="" disabled>Select a skill...</option>
                      {allSkills.map(skill => (
                        <option key={skill.skill_id} value={skill.skill_id}>{skill.name} ({skill.category})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: '1', minWidth: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Proficiency Level</label>
                    <select 
                      value={selectedLevel} 
                      onChange={(e) => {
                        setSelectedLevel(e.target.value);
                        setSkillFormError('');
                      }}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--course-bg)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                    >
                      <option value="" disabled>Select a level...</option>
                      <option value="1">1 - Beginner</option>
                      <option value="2">2 - Basic</option>
                      <option value="3">3 - Intermediate</option>
                      <option value="4">4 - Advanced</option>
                      <option value="5">5 - Expert</option>
                    </select>
                  </div>
                  <button type="submit" className="submit-btn" style={{ flex: '0 0 auto', padding: '12px 24px', whiteSpace: 'nowrap' }}>
                    Save Skill
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Delete Confirmation Modal */}
      {skillToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--course-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', width: '400px', maxWidth: '90%', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Remove Skill?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to remove <strong>{skillToDelete.skill}</strong> from your profile? This action cannot be undone, and will affect your match scores for courses requiring this skill.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSkillToDelete(null)}
                style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveSkill}
                style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Update Success Modal */}
      {profileSuccessMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'var(--course-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', width: '400px', maxWidth: '90%', boxShadow: 'var(--shadow-xl)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Success!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {profileSuccessMessage}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--sidebar-active-bg)', fontSize: '0.9rem', fontWeight: '500' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(56, 189, 248, 0.3)', borderTop: '2px solid var(--sidebar-active-bg)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Redirecting to Login...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
