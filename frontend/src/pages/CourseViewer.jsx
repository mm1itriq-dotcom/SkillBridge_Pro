import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CourseViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  
  useEffect(() => {
    // We can fetch course details from the catalog endpoint or a dedicated endpoint.
    // For now, let's fetch the catalog and find our course.
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetch('/courses/catalog', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.catalog) {
          const found = data.catalog.find(c => c.course_id === id);
          if (found) setCourse(found);
        }
      });
  }, [id, navigate]);

  const handleBack = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'instructor') {
          navigate('/instructor');
          return;
        }
      } catch(e) {}
    }
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 60px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: 'var(--course-bg)' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </button>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{course ? course.title : 'Loading Course...'}</h2>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Video Player Area */}
        <div style={{ flex: 3, padding: '40px 60px', overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ textAlign: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, marginBottom: '16px' }}><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '500' }}>Module 1: Introduction</h3>
            </div>
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Module 1: Introduction</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {course ? course.description : 'Loading details...'}
            </p>
          </div>
        </div>

        {/* Course Syllabus Sidebar */}
        <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'var(--course-bg)', borderLeft: '1px solid var(--border-color)', overflowY: 'auto' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Course Content</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--primary-color)' }}></div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>25% Complete</span>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', backgroundColor: 'var(--sidebar-hover)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>1. Introduction</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>12 mins</div>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' }}>2. Core Concepts</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>24 mins</div>
            </div>
          </div>

          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-muted)', marginBottom: '4px' }}>3. Advanced Implementation</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>45 mins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
