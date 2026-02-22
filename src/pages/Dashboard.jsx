import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  // NAVIGATION TABS
  // ✅ DEFAULT IS NOW 'home' (Announcements)
  const [activeTab, setActiveTab] = useState('home'); 
  const [courseTab, setCourseTab] = useState('my');

  // DATA STATES
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // ADMIN STATES
  const [newCourse, setNewCourse] = useState({ course_code: '', course_name: '', credits: 3 });
  const [gradeForm, setGradeForm] = useState({ student_email: '', course_code: '', grade: '' });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const userRes = await axios.get(`${API_URL}/users/me`);
      setUser(userRes.data);

      const myRes = await axios.get(`${API_URL}/my-courses`);
      setMyCourses(myRes.data);

      const allRes = await axios.get(`${API_URL}/courses`);
      setCourses(allRes.data);

      const gradesRes = await axios.get(`${API_URL}/my-grades`);
      setGrades(gradesRes.data);

      try {
        const annRes = await axios.get(`${API_URL}/announcements`);
        setAnnouncements(annRes.data);
      } catch (error) {
        console.log("No announcements found");
      }

    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  useEffect(() => { fetchData(); }, [navigate]);

  // --- 2. ACTIONS ---
  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API_URL}/enroll`, { courseId });
      alert("Enrolled successfully!");
      fetchData();
      setCourseTab('my'); 
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  // ADMIN ACTIONS
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/courses`, newCourse);
      alert("Course Created!");
      setNewCourse({ course_code: '', course_name: '', credits: 3 });
      fetchData();
    } catch (err) {
      alert("Failed to create course");
    }
  };

  const handleDeleteCourse = async (id) => {
    if(!confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_URL}/courses/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleAssignGrade = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_URL}/grades`, gradeForm);
          alert("Grade Assigned Successfully!");
          setGradeForm({ student_email: '', course_code: '', grade: '' });
          fetchData();
      } catch (err) {
          alert(err.response?.data?.message || "Failed to assign grade");
      }
  };

  if (!user) return <div className="loading">Loading Portal...</div>;

  const fullName = user.first_name 
    ? `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`
    : user.fullname;

  const isAdmin = user.role === 'admin';

  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="sidebar">
        <div className="sidebar-header">TIGERLOOK UNIVERSITY</div>
        
        {/* 🏠 HOME TAB (Announcements) */}
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span>🏠 Home</span>
        </div>

        {/* 👤 PROFILE TAB (New Separate Tab) */}
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span>👤 Profile</span>
        </div>
        
        <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          <span>📚 Courses</span>
        </div>

        <div className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>
          <span>📊 Grades</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
            <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                <span>🚪 Sign Out</span>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* HEADER BANNER (Laging visible) */}
        <div className="profile-banner">
          <div className="big-avatar">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-name">{fullName}</div>
          <div className="profile-id">
             ID: {user.id.substring(0, 8).toUpperCase()} | {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
          </div>
        </div>

        {/* --- VIEW 1: HOME (ANNOUNCEMENTS ONLY) --- */}
        {activeTab === 'home' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                        📢 Latest Announcements
                    </h2>
                    
                    {announcements.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                            <p>🎉 Welcome to Tiger Look Portal!</p>
                            <p style={{ fontSize: '0.9rem' }}>No new announcements at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {announcements.map((ann) => (
                                <div key={ann.id} style={{ borderLeft: '5px solid #3b82f6', background: '#f8fafc', padding: '1.5rem', borderRadius: '0 8px 8px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{ann.title}</h3>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>
                                            {new Date(ann.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- VIEW 2: PROFILE (DETAILS ONLY) --- */}
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

        {/* --- VIEW 3: COURSE MANAGER --- */}
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

        {/* --- VIEW 4: GRADES --- */}
        {activeTab === 'grades' && (
            <div className="info-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="card-header">Academic Records & Grades</div>
                
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