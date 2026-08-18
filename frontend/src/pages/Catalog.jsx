import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/courses/catalog', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setCourses(data.catalog);
      } else {
        setError(data.error || 'Failed to load catalog');
      }
    } catch (err) {
      setError('Network error trying to fetch catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [navigate]);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Re-fetch catalog to update the is_enrolled statuses
        fetchCatalog();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch (err) {
      alert('Network error while enrolling');
    }
  };

  const token = localStorage.getItem('token');
  let role = 'student';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    } catch(e) {}
  }

  if (loading) return <div className="page-loader">Loading catalog...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  const uniqueSkills = [...new Set(courses.flatMap(c => c.all_requirements || []))].sort();

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === '' || (c.all_requirements && c.all_requirements.includes(selectedFilter));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="catalog-container">
      <div className="catalog-header" style={{ marginBottom: '24px' }}>
        <h1>Course Catalog</h1>
        <p>
          {role === 'instructor' 
            ? "Browse all available courses currently published on the platform." 
            : "Discover precision-matched courses tailored to your current skill profile."}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search for courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--course-bg)', color: 'var(--text-main)', fontSize: '1rem' }}
          />
        </div>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--course-bg)', color: 'var(--text-main)', fontSize: '1rem' }}
          >
            <option value="">All Skills</option>
            {uniqueSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--course-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
             <h3 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>No courses found</h3>
             <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search query or skill filter.</p>
          </div>
        ) : (
          filteredCourses.map(course => {
            const matchInt = parseInt(course.match_percentage.replace('%', ''));
            // Determine progress bar color based on match score
            let barColor = '#ef4444'; // Red for < 50%
            if (matchInt >= 50 && matchInt < 80) barColor = '#eab308'; // Yellow
            if (matchInt >= 80) barColor = '#22c55e'; // Green

            return (
              <div key={course.course_id} className="course-card">
                <div className="course-card-content">
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  
                  {role !== 'instructor' && (
                    <>
                      <div className="match-section">
                        <div className="match-header">
                          <span className="match-label">Match Score</span>
                          <span className="match-value" style={{ color: barColor }}>{course.match_percentage}</span>
                        </div>
                        <div className="progress-bg">
                          <div className="progress-fill" style={{ width: course.match_percentage, backgroundColor: barColor }}></div>
                        </div>
                      </div>

                      {course.missing_skills && course.missing_skills.length > 0 && (
                        <div className="missing-skills-section">
                          <h4>Skill Gaps to Bridge:</h4>
                          <div className="badges-container">
                            {course.missing_skills.map((skill, idx) => (
                              <span key={idx} className="skill-badge">
                                {skill.skill} <span className="badge-level">{skill.needed}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {role !== 'instructor' && (
                  <div className="course-card-footer">
                    {course.is_enrolled ? (
                      <button className="enrolled-btn" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Enrolled
                      </button>
                    ) : (
                      <button 
                        className="enroll-btn" 
                        onClick={() => handleEnroll(course.course_id)}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
