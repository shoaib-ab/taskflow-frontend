import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriorityChange = (priority) => {
    setFormData((prev) => ({
      ...prev,
      priority,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Task Created:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-gray-100 font-display transition-colors duration-200 min-h-screen flex flex-col">
      <ThemeToggle />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#161e2d] px-4 md:px-10 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">TaskMaster</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="/dashboard">Dashboard</Link>
              <Link className="text-sm font-medium text-primary" to="#">Projects</Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="#">Teams</Link>
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" to="#">Reports</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-gray-400 text-sm mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-40 placeholder:text-gray-400" placeholder="Search tasks..." type="text"/>
            </div>
            <div className="h-8 w-8 rounded-full bg-cover bg-center ring-2 ring-gray-100 dark:ring-gray-800" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqnRphzOg7VxITIskCGBjq8mM72oNfIxLMB9Ke3lfsj_zjXs0QWWOdxqrkZclubsX7mYjmfbDsnJJOvufGFxA3JAra5OVIDmy1dpxCIChD4k9gDoeUvFBz_2hlw6CGOvszj3hhfwWvDN5WOY2b4h0_wmKTpgJHEHDSaJZ71TOb_BjhkRu74SKycDpnahvc1i06XgRAYokWlHGzWA7HAKMCwaY_RdxGq-tiYQx9VvSRtCeWphinSAZG5m0H1A3LvACvmY6AXXjIPZc')" }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-[800px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-sm">
            <Link className="text-gray-500 hover:text-primary" to="/dashboard">Dashboard</Link>
            <span className="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
            <Link className="text-gray-500 hover:text-primary" to="/dashboard">All Tasks</Link>
            <span className="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
            <span className="font-semibold text-primary">New Task</span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create New Task</h1>
            <p className="text-gray-500 dark:text-gray-400">Fill in the technical details to initiate a new sprint item.</p>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-[#1a2333] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Task Title</label>
                <input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                  placeholder="e.g., Implement OAuth2.0 with Passport.js" 
                  type="text"
                  required
                />
                <p className="text-xs text-gray-400">Be descriptive but concise.</p>
              </div>

              {/* Description & Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" 
                    placeholder="Break down the technical requirements and acceptance criteria..." 
                    rows="6"
                    required
                  ></textarea>
                </div>

                {/* Status & Metadata */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                    <div className="relative group">
                      <select 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">radio_button_checked</span>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map((p) => (
                        <button 
                          key={p}
                          type="button"
                          onClick={() => handlePriorityChange(p.toLowerCase())}
                          className={`flex-1 py-2 px-3 text-xs font-medium rounded border transition-colors ${
                            formData.priority === p.toLowerCase() 
                            ? 'border-2 border-primary text-primary bg-primary/5' 
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Upload Task Image</label>
                <div className="relative group cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary mb-2 transition-colors">cloud_upload</span>
                      <p className="mb-1 text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                    </div>
                    <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file"/>
                  </div>
                </div>
                
                {/* Image Previews */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="relative group size-20 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnJjZ2GFGnGmRUEigdYq-QFtLTxfNrN9se3NpfC14CIiGVZYpttRZxDcEYMcRIUTP0UsLD839HrQDYgHxoLy_dSxTcN8cDCbmTeZEKnz9-khmK0N5QRntt4SO0qgu7WsL1uLD7waqvj6KWVyZ1TKlo91bx39x1D6sQJ81EkrGFtN4NSFUZCiOD7mNcNOe_LDAntSKCnlyfnPdds7zivcWT9zdMB5ZtGIg7LB6mk3vf73-TcBemdHhN0ZmNiUcfGLWlCWAgVYkyGCw')" }}></div>
                    <button type="button" className="absolute top-1 right-1 bg-white/80 dark:bg-black/80 p-0.5 rounded-full text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  <div className="size-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 hover:text-primary hover:border-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-6 h-11 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" 
                  type="button"
                >
                  Cancel
                </button>
                <button className="px-8 h-11 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2" type="submit">
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Task
                </button>
              </div>
            </form>
          </div>

          {/* Technical Footer Info */}
          <div className="mt-8 flex justify-between items-center text-xs text-gray-400 px-2">
            <p>MERN Stack Instance: v2.4.0</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> API Online</span>
              <span>Auto-saving draft...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTask;
