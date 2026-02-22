import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  // NAVIGATION & THEME
  const [activeTab, setActiveTab] = useState('home'); 
  const [courseTab, setCourseTab] = useState('my');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // 🌙 Theme State

  // DATA STATES
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // PROFILE EDIT STATES
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ gender: '', birthdate: '' });

  // ADMIN STATES
  const [newCourse, setNewCourse] = useState({ course_code: '', course_name: '', credits: 3 });
  const [gradeForm, setGradeForm] = useState({ student_email: '', course_code: '', grade: '' });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // --- 0. THEME EFFECT ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    try {
      const userRes = await axios.get(`${API_URL}/users/me`);
      setUser(userRes.data);
      // Initialize edit form with current data
      setEditForm({ 
        gender: userRes.data.gender || 'Not specified', 
        birthdate: userRes.data.birthdate ? userRes.data.birthdate.split('T')[0] : '' 
      });

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

  // UPDATE PROFILE ACTION
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`${API_URL}/users/update-profile`, editForm);
        alert("Profile Updated Successfully!");
        setIsEditing(false);
        fetchData(); // Refresh data
    } catch (err) {
        alert("Failed to update profile");
    }
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

  // Styles that need to adapt to theme (using CSS variables)
  const cardStyle = { 
    background: 'var(--card-bg)', 
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem', 
    borderRadius: '10px', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
  };

  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="sidebar" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="sidebar-header" style={{ color: 'white' }}>TIGERLOOK UNIVERSITY</div>
        
        {/* 🏠 HOME TAB */}
        <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span>🏠 Home</span>
        </div>

        {/* 👤 PROFILE TAB */}
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
            {/* 🌙 DARK MODE TOGGLE */}
            <div className="nav-item" onClick={toggleTheme}>
                <span>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
            </div>

            <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                <span>🚪 Sign Out</span>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="main-content" style={{ background: 'var(--bg-color)' }}>
        
        {/* --- VIEW 1: HOME (ANNOUNCEMENTS) --- */}
        {activeTab === 'home' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={cardStyle}>
                    <h1 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                        📢 Announcements
                    </h1>
                    
                    {announcements.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', borderRadius: '8px' }}>
                            <p>🎉 Welcome to Tiger Look Portal!</p>
                            <p style={{ fontSize: '1rem' }}>Sir Doncoy Gwapings mo!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {announcements.map((ann) => (
                                <div key={ann.id} style={{ borderLeft: '5px solid var(--primary)', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>{ann.title}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '10px' }}>
                                            {new Date(ann.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- VIEW 2: PROFILE (EDITABLE) --- */}
        {activeTab === 'profile' && (
            <div>
                <div className="profile-banner" style={{ background: 'linear-gradient(135deg, var(--primary), #1e293b)' }}>
                    <div className="big-avatar">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-name">{fullName}</div>
                    <div className="profile-id">
                        ID: {user.id.substring(0, 8).toUpperCase()} | {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-card" style={cardStyle}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Basic Information</span>
                            {/* ✏️ EDIT BUTTON */}
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                                    ✏️ Edit Info
                                </button>
                            )}
                        </div>

                        {/* EDIT FORM */}
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="info-row">
                                    <span className="label">Full Name</span>
                                    <span className="value" style={{color: 'var(--text-secondary)'}}>{fullName.toUpperCase()} (Locked)</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Gender</span>
                                    <select 
                                        value={editForm.gender} 
                                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="Not specified">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="info-row">
                                    <span className="label">Birthday</span>
                                    <input 
                                        type="date" 
                                        value={editForm.birthdate} 
                                        onChange={(e) => setEditForm({...editForm, birthdate: e.target.value})}
                                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="primary-btn" style={{ padding: '8px 16px' }}>Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            // DISPLAY MODE
                            <>
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
                            </>
                        )}
                    </div>

                    <div className="info-card" style={cardStyle}>
                        <div className="card-header">System Settings</div>
                        <div className="info-row">
                            <span className="label">Theme</span>
                            <span className="value" style={{ textTransform: 'capitalize' }}>{theme} Mode</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Privacy Settings</span>
                            <span className="value">Standard</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW 3: COURSE MANAGER --- */}
        {activeTab === 'courses' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                        <div 
                            style={{ padding: '1rem 2rem', cursor: 'pointer', borderBottom: courseTab === 'my' ? '3px solid var(--primary)' : 'none', fontWeight: courseTab === 'my' ? 'bold' : 'normal', color: courseTab === 'my' ? 'var(--primary)' : 'var(--text-secondary)' }}
                            onClick={() => setCourseTab('my')}
                        >
                            My Enrolled Courses
                        </div>
                        <div 
                            style={{ padding: '1rem 2rem', cursor: 'pointer', borderBottom: courseTab === 'all' ? '3px solid var(--primary)' : 'none', fontWeight: courseTab === 'all' ? 'bold' : 'normal', color: courseTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)' }}
                            onClick={() => setCourseTab('all')}
                        >
                            All Available Courses
                        </div>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {isAdmin && courseTab === 'all' && (
                            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px dashed var(--border-color)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Admin: Add New Course</h4>
                                <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                    <div style={{flex: 1}}>
                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Code</label>
                                        <input placeholder="CS101" value={newCourse.course_code} onChange={e => setNewCourse({...newCourse, course_code: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                    </div>
                                    <div style={{flex: 2}}>
                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Course Name</label>
                                        <input placeholder="Intro to Programming" value={newCourse.course_name} onChange={e => setNewCourse({...newCourse, course_name: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                    </div>
                                    <div style={{width: '80px'}}>
                                        <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Credits</label>
                                        <input type="number" placeholder="3" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                    </div>
                                    <button type="submit" className="primary-btn" style={{width: 'auto', padding: '0 20px', height: '42px'}}>Add</button>
                                </form>
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-color)' }}>Code</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-color)' }}>Course Name</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-color)' }}>Credits</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-color)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(courseTab === 'my' ? myCourses : courses).map(course => (
                                    <tr key={course.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No courses enrolled yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW 4: GRADES --- */}
        {activeTab === 'grades' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={cardStyle}>
                    <div className="card-header">Academic Records & Grades</div>
                    
                    {isAdmin && (
                        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '1rem'}}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Admin: Assign Grade</h4>
                            <form onSubmit={handleAssignGrade} style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
                                <div style={{flex: 2}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Student Email</label>
                                    <input placeholder="student@example.com" value={gradeForm.student_email} onChange={e=>setGradeForm({...gradeForm, student_email: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Course Code</label>
                                    <input placeholder="CS101" value={gradeForm.course_code} onChange={e=>setGradeForm({...gradeForm, course_code: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Grade</label>
                                    <input placeholder="A / 95" value={gradeForm.grade} onChange={e=>setGradeForm({...gradeForm, grade: e.target.value})} style={{marginBottom: 0, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px'}} required />
                                </div>
                                <button type="submit" className="primary-btn" style={{width: 'auto', padding: '0 20px', height: '42px'}}>Assign</button>
                            </form>
                        </div>
                    )}

                    <div style={{padding: '1rem'}}>
                        {grades.length === 0 ? <p style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>No grades recorded yet.</p> : (
                            <table style={{width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)'}}>
                                <thead>
                                    <tr style={{textAlign: 'left', borderBottom: '2px solid var(--border-color)', background: 'var(--bg-color)'}}>
                                        <th style={{padding: '12px'}}>Course Code</th>
                                        <th style={{padding: '12px'}}>Course Name</th>
                                        <th style={{padding: '12px'}}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grades.map((g, i) => (
                                        <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
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
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;