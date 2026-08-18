import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/instructor/delete_course/${courseToDelete.course_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCourseToDelete(null);
        setCourses(courses.filter(c => c.course_id !== courseToDelete.course_id));
      } else {
        alert('Failed to delete course.');
      }
    } catch (err) {
      alert('Network error deleting course.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchMyCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/instructor/my_courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses || []);
        } else {
          setError(data.error || 'Failed to load instructor courses');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [navigate]);

  if (loading) return <div className="page-loader">Loading instructor dashboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Manage the courses you have authored and published.</p>
        </div>
        <button 
          className="submit-btn" 
          style={{ width: 'auto', padding: '12px 24px' }}
          onClick={() => navigate('/instructor/create')}
        >
          + Create New Course
        </button>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--course-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>No courses published</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't created any courses yet.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.course_id} className="course-card">
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Published: {new Date(course.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="course-card-footer" style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="enroll-btn" 
                  style={{ flex: 1, backgroundColor: 'var(--badge-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                  onClick={() => navigate(`/instructor/edit/${course.course_id}`)}
                >
                  Manage Course
                </button>
                <button 
                  title="Delete Course"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}
                  onClick={() => setCourseToDelete(course)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--course-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', width: '400px', maxWidth: '90%', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-main)' }}>Delete Course?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>{courseToDelete.title}</strong>? All associated enrollments and skill requirements will be destroyed. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCourse}
                disabled={isDeleting}
                style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isDeleting && <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
