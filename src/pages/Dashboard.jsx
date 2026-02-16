import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  // NAVIGATION TABS
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'courses', 'grades'
  const [courseTab, setCourseTab] = useState('my');      // 'my' vs 'all'

  // DATA STATES
  const [courses, setCourses] = useState([]);      // All Available Courses
  const [myCourses, setMyCourses] = useState([]);  // Enrolled Courses
  const [grades, setGrades] = useState([]);        // Student Grades

  // ADMIN STATES
  const [newCourse, setNewCourse] = useState({ course_code: '', course_name: '', credits: 3 });
  const [gradeForm, setGradeForm] = useState({ student_email: '', course_code: '', grade: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '', middle_name: '', last_name: '', suffix: '', gender: '', birthdate: ''
});

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      // Fetch User
      const userRes = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
      setUser(userRes.data);

      // Fetch Enrolled Courses
      const myRes = await axios.get(`${API_URL}/my-courses`, { withCredentials: true });
      setMyCourses(myRes.data);

      // Fetch All Courses
      const allRes = await axios.get(`${API_URL}/courses`, { withCredentials: true });
      setCourses(allRes.data);

      // Fetch Grades
      const gradesRes = await axios.get(`${API_URL}/my-grades`, { withCredentials: true });
      setGrades(gradesRes.data);

    } catch (err) {
      navigate('/login');
    }

  };

  useEffect(() => { fetchData(); }, [navigate]);

  // --- 2. ACTIONS ---
  const handleLogout = async () => {
    await axios.post(`${API_URL}/auth/logout`);
    navigate('/login');
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API_URL}/enroll`, { courseId }, { withCredentials: true });
      alert("Enrolled successfully!");
      fetchData();
      setCourseTab('my'); 
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  // ADMIN: Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/courses`, newCourse, { withCredentials: true });
      alert("Course Created!");
      setNewCourse({ course_code: '', course_name: '', credits: 3 });
      fetchData();
    } catch (err) {
      alert("Failed to create course");
    }
  };

  // ADMIN: Delete Course
  const handleDeleteCourse = async (id) => {
    if(!confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_URL}/courses/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // ADMIN: Assign Grade
  const handleAssignGrade = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_URL}/grades`, gradeForm, { withCredentials: true });
          alert("Grade Assigned Successfully!");
          setGradeForm({ student_email: '', course_code: '', grade: '' }); // Reset form
          fetchData(); // Refresh to see updates
      } catch (err) {
          alert(err.response?.data?.message || "Failed to assign grade");
      }
  };

  if (!user) return <div className="loading">Loading Portal...</div>;

  // Helper: Format Full Name
  const fullName = user.first_name 
    ? `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`
    : user.fullname;

  const isAdmin = user.role === 'admin';

  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div className="sidebar-header">TIGERLOOK UNIVERSITY</div>
        
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span>👤 Profile</span>
        </div>

        <div className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
            <span> Assignments</span>
        </div>
        
        <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          <span> Courses</span>
        </div>

        {/* NEW GRADES TAB */}
        <div className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>
          <span>  Grades</span>
        </div>
        
        <div className="nav-item">
          <span>  Calendar</span>
        </div>
        
        <div className="nav-item">
          <span>  Messages</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
            <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                <span>🚪 Sign Out</span>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* PROFILE HEADER */}
        <div className="profile-banner">
          <div className="big-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-name">{fullName}</div>
          <div className="profile-id">
             ID: {user.id.substring(0, 8).toUpperCase()} | {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
          </div>
        </div>

        {/* --- VIEW 1: PROFILE GRID --- */}
        {activeTab === 'profile' && (
            <div className="info-grid">
                <div className="info-card">
                    <div className="card-header">Basic Information</div>
                    <div className="info-row">
                        <span className="label">Full Name</span>
                        <span className="value">{fullName.toUpperCase()}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Email Address</span>
                        <span className="value">{user.email}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Gender</span>
                        <span className="value">{user.gender || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Birthday</span>
                        <span className="value">{user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="card-header">System Settings</div>
                    <div className="info-row">
                        <span className="label">Language</span>
                        <span className="value">English (United States)</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Privacy Settings</span>
                        <span className="value">Standard</span>
                    </div>
                     <div className="info-row">
                        <span className="label">Notifications</span>
                        <span className="value">Stream notifications</span>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW 2: COURSE MANAGER --- */}
        {activeTab === 'courses' && (
            <div className="info-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #eeeeee' }}>
                    <div 
                        style={{ padding: '1rem 2rem', cursor: 'pointer', borderBottom: courseTab === 'my' ? '3px solid var(--primary)' : 'none', fontWeight: courseTab === 'my' ? 'bold' : 'normal', color: courseTab === 'my' ? 'var(--primary)' : '#64748b' }}
                        onClick={() => setCourseTab('my')}
                    >
                        My Enrolled Courses
                    </div>
                    <div 
                        style={{ padding: '1rem 2rem', cursor: 'pointer', borderBottom: courseTab === 'all' ? '3px solid var(--primary)' : 'none', fontWeight: courseTab === 'all' ? 'bold' : 'normal', color: courseTab === 'all' ? 'var(--primary)' : '#ebebeb' }}
                        onClick={() => setCourseTab('all')}
                    >
                        All Available Courses
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {isAdmin && courseTab === 'all' && (
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px dashed #cbd5e1' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Admin: Add New Course</h4>
                            <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem'}}>Code</label>
                                    <input placeholder="CS101" value={newCourse.course_code} onChange={e => setNewCourse({...newCourse, course_code: e.target.value})} style={{marginBottom: 0}} required />
                                </div>
                                <div style={{flex: 2}}>
                                    <label style={{fontSize: '0.8rem'}}>Course Name</label>
                                    <input placeholder="Intro to Programming" value={newCourse.course_name} onChange={e => setNewCourse({...newCourse, course_name: e.target.value})} style={{marginBottom: 0}} required />
                                </div>
                                <div style={{width: '80px'}}>
                                    <label style={{fontSize: '0.8rem'}}>Credits</label>
                                    <input type="number" placeholder="3" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} style={{marginBottom: 0}} required />
                                </div>
                                <button type="submit" className="primary-btn" style={{width: 'auto', padding: '0 20px', height: '42px'}}>Add</button>
                            </form>
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Code</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Course Name</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Credits</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(courseTab === 'my' ? myCourses : courses).map(course => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{course.course_code}</td>
                                    <td style={{ padding: '12px' }}>{course.course_name}</td>
                                    <td style={{ padding: '12px' }}>{course.credits}</td>
                                    <td style={{ padding: '12px' }}>
                                        {courseTab === 'all' && (
                                            isAdmin ? (
                                                <button onClick={() => handleDeleteCourse(course.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                            ) : (
                                                myCourses.some(c => c.id === course.id) ? (
                                                    <span style={{ color: 'green', fontWeight: 'bold' }}>Enrolled</span>
                                                ) : (
                                                    <button onClick={() => handleEnroll(course.id)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Enroll</button>
                                                )
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(courseTab === 'my' && myCourses.length === 0) && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No courses enrolled yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- VIEW 3: GRADES (NEW!) --- */}
        {activeTab === 'grades' && (
            <div className="info-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="card-header">Academic Records & Grades</div>
                
                {/* ADMIN VIEW: Assign Grade Form */}
                {isAdmin && (
                    <div style={{padding: '1.5rem', borderBottom: '1px solid #eee', background: '#f8fafc'}}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Admin: Assign Grade</h4>
                        <form onSubmit={handleAssignGrade} style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
                            <div style={{flex: 2}}>
                                <label style={{fontSize: '0.8rem'}}>Student Email</label>
                                <input placeholder="student@example.com" value={gradeForm.student_email} onChange={e=>setGradeForm({...gradeForm, student_email: e.target.value})} style={{marginBottom: 0}} required />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={{fontSize: '0.8rem'}}>Course Code</label>
                                <input placeholder="CS101" value={gradeForm.course_code} onChange={e=>setGradeForm({...gradeForm, course_code: e.target.value})} style={{marginBottom: 0}} required />
                            </div>
                            <div style={{flex: 1}}>
                                <label style={{fontSize: '0.8rem'}}>Grade</label>
                                <input placeholder="A / 95" value={gradeForm.grade} onChange={e=>setGradeForm({...gradeForm, grade: e.target.value})} style={{marginBottom: 0}} required />
                            </div>
                            <button type="submit" className="primary-btn" style={{width: 'auto', padding: '0 20px', height: '42px'}}>Assign</button>
                        </form>
                    </div>
                )}

                {/* STUDENT/LIST VIEW */}
                <div style={{padding: '1rem'}}>
                    {grades.length === 0 ? <p style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>No grades recorded yet.</p> : (
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{textAlign: 'left', borderBottom: '2px solid #eee', background: '#f9f9f9'}}>
                                    <th style={{padding: '12px'}}>Course Code</th>
                                    <th style={{padding: '12px'}}>Course Name</th>
                                    <th style={{padding: '12px'}}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g, i) => (
                                    <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                                        <td style={{padding: '12px', fontWeight: 'bold'}}>{g.course_code}</td>
                                        <td style={{padding: '12px'}}>{g.course_name}</td>
                                        <td style={{padding: '12px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem'}}>{g.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;