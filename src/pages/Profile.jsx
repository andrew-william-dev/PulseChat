import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Mail, User, Edit2, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from "../context/AuthContext"

export default function Profile() {
  const { user, setUser } = useAuth(); // ✅ Use user & setUser from context
  const [isEditing, setIsEditing] = useState(false);
  const { setThemeColor } = useTheme();

  const [temp, setTemp] = useState({
    avatar: '',
    bio: '',
    location: '',
    interests: '',
    website: '',
    theme_color: '#3b82f6',
  });

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        const { user } = res.data;
        setUser(user); // ✅ Update AuthContext
        setTemp({
          avatar: user.avatar || '',
          bio: user.bio || '',
          location: user.location || '',
          interests: user.interests || '',
          website: user.website || '',
          theme_color: user.theme_color || '#3b82f6',
        });
        setThemeColor(user.theme_color);
      })
      .catch(() => toast.error('Failed to fetch profile'));
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (user) {
      setTemp({
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || '',
        website: user.website || '',
        theme_color: user.theme_color || '#3b82f6',
      });
    }
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    try {
      await api.put('/profile', { ...temp });
      setUser({ ...user, ...temp }); // ✅ Update global context
      setThemeColor(temp.theme_color);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10 flex gap-10">

        {/* Left Sidebar */}
        <div className="w-1/3 flex flex-col items-center border-r pr-8">
          <img
            src={temp.avatar}
            alt="avatar"
            className="w-44 h-44 rounded-full object-cover border mb-4"
          />
          {isEditing && (
            <input
              type="text"
              value={temp.avatar}
              onChange={(e) => setTemp({ ...temp, avatar: e.target.value })}
              placeholder="Image URL"
              className="w-full border p-2 rounded mb-4"
            />
          )}
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User size={18} /> {user.username}
          </h2>
          <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
            <Mail size={16} /> {user.email}
          </p>
        </div>

        {/* Right Content */}
        <div className="w-2/3 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-500">Update your personal information</p>
          </div>

          {/* Bio */}
          <Section title="Bio">
            {isEditing ? (
              <textarea
                rows={4}
                value={temp.bio}
                onChange={(e) => setTemp({ ...temp, bio: e.target.value })}
                className="w-full border rounded-lg p-3"
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-line">
                {temp.bio || 'No bio provided.'}
              </p>
            )}
          </Section>

          {/* Location */}
          <Section title="Location">
            {isEditing ? (
              <input
                type="text"
                value={temp.location}
                onChange={(e) => setTemp({ ...temp, location: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="e.g., Bengaluru, India"
              />
            ) : (
              <p className="text-gray-800 flex items-center gap-1">
                <MapPin size={16} /> {temp.location || 'No location set'}
              </p>
            )}
          </Section>

          {/* Interests */}
          <Section title="Interests">
            {isEditing ? (
              <input
                type="text"
                value={temp.interests}
                onChange={(e) => setTemp({ ...temp, interests: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="e.g., Reading, Hiking, Coding"
              />
            ) : (
              <p className="text-gray-800">{temp.interests || 'No interests listed'}</p>
            )}
          </Section>

          {/* Website */}
          <Section title="Website">
            {isEditing ? (
              <input
                type="text"
                value={temp.website}
                onChange={(e) => setTemp({ ...temp, website: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="https://yourwebsite.com"
              />
            ) : temp.website ? (
              <a href={temp.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                <Globe size={16} /> {temp.website}
              </a>
            ) : (
              <p className="text-gray-500 italic">No website</p>
            )}
          </Section>

          {/* Theme */}
          <Section title="Theme Color">
            {isEditing ? (
              <input
                type="color"
                value={temp.theme_color}
                onChange={(e) => setTemp({ ...temp, theme_color: e.target.value })}
                className="w-16 h-10 p-0 border rounded"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: temp.theme_color }}
                ></span>
                <span className="text-gray-700">{temp.theme_color}</span>
              </div>
            )}
          </Section>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable section block
function Section({ title, children }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{title}</label>
      {children}
    </div>
  );
}
