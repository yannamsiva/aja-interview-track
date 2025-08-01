import React, { useState, useEffect } from 'react';
import { FiUsers, FiSettings, FiActivity, FiLock, FiMail, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee',
    technology: 'java'
  });

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setUsers([
      { id: 1, name: 'Admin User', email: 'admin@aja.com', role: 'admin', lastLogin: '2023-05-15 09:30' },
      { id: 2, name: 'Delivery Head', email: 'delivery@aja.com', role: 'delivery', lastLogin: '2023-05-15 10:15' },
      { id: 3, name: 'Sales Manager', email: 'sales@aja.com', role: 'sales', lastLogin: '2023-05-14 14:20' },
      { id: 4, name: 'John Doe', email: 'john@aja.com', role: 'employee', technology: 'java', lastLogin: '2023-05-14 16:45' },
      { id: 5, name: 'Jane Smith', email: 'jane@aja.com', role: 'employee', technology: 'python', lastLogin: '2023-05-15 08:10' }
    ]);

    setSystemMetrics({
      totalUsers: 150,
      activeUsers: 132,
      mockInterviews: 85,
      clientInterviews: 42,
      placements: 28,
      systemHealth: 'optimal'
    });
  }, []);

  const roleDistribution = [
    { name: 'Employees', value: 132 },
    { name: 'Delivery Team', value: 8 },
    { name: 'Sales Team', value: 5 },
    { name: 'Admins', value: 2 }
  ];

  const technologyDistribution = [
    { name: 'Java', value: 42 },
    { name: 'Python', value: 35 },
    { name: '.NET', value: 28 },
    { name: 'DevOps', value: 15 },
    { name: 'SalesForce', value: 12 },
    { name: 'UI Development', value: 10 },
    { name: 'Testing', value: 8 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    // In real app, this would call API
    alert(`User ${newUser.name} added successfully`);
    setNewUser({
      name: '',
      email: '',
      role: 'employee',
      technology: 'java'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className={styles.usersSection}>
            <div className={styles.sectionHeader}>
              <h3>User Management</h3>
              <button 
                className={styles.primaryButton}
                onClick={() => setSelectedUser({})}
              >
                Add New User
              </button>
            </div>
            
            <div className={styles.usersList}>
              {users.map(user => (
                <motion.div 
                  key={user.id}
                  className={styles.userCard}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className={styles.userAvatar}>
                    {user.name.charAt(0)}
                  </div>
                  <div className={styles.userInfo}>
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <div className={styles.userMeta}>
                      <span className={`${styles.userRole} ${styles[user.role]}`}>
                        {user.role}
                      </span>
                      {user.technology && (
                        <span className={styles.userTech}>
                          {user.technology}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.userLastLogin}>
                    <FiCalendar /> {user.lastLogin}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className={styles.analyticsSection}>
            <div className={styles.chartRow}>
              <div className={styles.chartContainer}>
                <h4>User Role Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className={styles.chartContainer}>
                <h4>Technology Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={technologyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <FiUsers size={24} />
                <div>
                  <h5>Total Users</h5>
                  <p className={styles.statValue}>{systemMetrics.totalUsers}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <FiActivity size={24} />
                <div>
                  <h5>Active Users</h5>
                  <p className={styles.statValue}>{systemMetrics.activeUsers}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <FiMail size={24} />
                <div>
                  <h5>Mock Interviews</h5>
                  <p className={styles.statValue}>{systemMetrics.mockInterviews}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <FiCalendar size={24} />
                <div>
                  <h5>Client Interviews</h5>
                  <p className={styles.statValue}>{systemMetrics.clientInterviews}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className={styles.settingsSection}>
            <h3>System Settings</h3>
            
            <div className={styles.settingsCard}>
              <h4>Email Notifications</h4>
              <div className={styles.settingItem}>
                <label>
                  <input type="checkbox" defaultChecked />
                  Send mock interview reminders
                </label>
              </div>
              <div className={styles.settingItem}>
                <label>
                  <input type="checkbox" defaultChecked />
                  Send client interview updates
                </label>
              </div>
              <div className={styles.settingItem}>
                <label>
                  <input type="checkbox" defaultChecked />
                  Send performance reports
                </label>
              </div>
            </div>
            
            <div className={styles.settingsCard}>
              <h4>System Configuration</h4>
              <div className={styles.formGroup}>
                <label>Default Interview Rating Scale</label>
                <select defaultValue="10">
                  <option value="5">5-point scale</option>
                  <option value="10">10-point scale</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>System Health</label>
                <div className={styles.systemHealth}>
                  <span className={styles[systemMetrics.systemHealth]}>
                    {systemMetrics.systemHealth}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.settingsActions}>
              <button className={styles.primaryButton}>
                Save Settings
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2>Admin Dashboard</h2>
        <div className={styles.adminStats}>
          <span>System Administrator</span>
        </div>
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> User Management
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiActivity /> Analytics
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings /> Settings
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
      
      {(selectedUser !== null) && (
        <div className={styles.modal}>
          <motion.div 
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3>{selectedUser.id ? 'Edit User' : 'Add New User'}</h3>
            
            <div className={styles.userForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={selectedUser.id ? selectedUser.name : newUser.name}
                  onChange={selectedUser.id ? null : handleInputChange}
                  disabled={!!selectedUser.id}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={selectedUser.id ? selectedUser.email : newUser.email}
                  onChange={selectedUser.id ? null : handleInputChange}
                  disabled={!!selectedUser.id}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Role</label>
                <select 
                  name="role"
                  value={selectedUser.id ? selectedUser.role : newUser.role}
                  onChange={selectedUser.id ? null : handleInputChange}
                  disabled={!!selectedUser.id}
                >
                  <option value="employee">Employee</option>
                  <option value="delivery">Delivery Team</option>
                  <option value="sales">Sales Team</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {(selectedUser.id ? selectedUser.role === 'employee' : newUser.role === 'employee') && (
                <div className={styles.formGroup}>
                  <label>Technology</label>
                  <select 
                    name="technology"
                    value={selectedUser.id ? selectedUser.technology : newUser.technology}
                    onChange={selectedUser.id ? null : handleInputChange}
                    disabled={!!selectedUser.id}
                  >
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="dotnet">.NET</option>
                    <option value="devops">DevOps</option>
                    <option value="salesforce">SalesForce</option>
                    <option value="ui">UI Development</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
              )}
              
              {selectedUser.id && (
                <div className={styles.formGroup}>
                  <label>Reset Password</label>
                  <button className={styles.secondaryButton}>
                    <FiLock /> Send Reset Link
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              {selectedUser.id ? (
                <>
                  <button className={styles.dangerButton}>
                    Deactivate User
                  </button>
                  <button 
                    className={styles.secondaryButton}
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.primaryButton}
                    onClick={handleAddUser}
                    disabled={!newUser.name || !newUser.email}
                  >
                    Add User
                  </button>
                  <button 
                    className={styles.secondaryButton}
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;