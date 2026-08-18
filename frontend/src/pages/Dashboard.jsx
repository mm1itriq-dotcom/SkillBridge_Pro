import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/courses/enrolled', {
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
          setEnrolledCourses(data.enrolled);
        } else {
          setError(data.error || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Network error trying to fetch dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) return <div className="page-loader">Loading dashboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>My Learning Dashboard</h1>
        <p>Resume your active courses and track your progress.</p>
      </div>

      <div className="courses-grid">
        {enrolledCourses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--sidebar-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>No active enrollments</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't enrolled in any courses yet.</p>
            <button 
              className="submit-btn" 
              style={{ width: 'auto', padding: '12px 24px' }}
              onClick={() => navigate('/catalog')}
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          enrolledCourses.map(course => (
            <div key={course.course_id} className="course-card">
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>
              </div>
              <div className="course-card-footer">
                <button 
                  className="enroll-btn" 
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderColor: 'var(--primary-color)' }}
                  onClick={() => navigate(`/course/${course.course_id}/view`)}
                >
                  Resume Learning
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
