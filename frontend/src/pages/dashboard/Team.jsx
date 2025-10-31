import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { UserPlus, Trash2, Shield } from 'lucide-react';

const Team = () => {
  const { userData, planDetails, canAddTeamMember, addTeamMember, removeTeamMember } = usePlan();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const teamMembers = userData?.teamMembers || [];
  const maxMembers = planDetails?.teamMembers || 1;

  const handleInvite = () => {
    if (!inviteEmail) return alert('Please enter an email');
    try {
      addTeamMember({
        id: `user_${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: 'member',
        joinedAt: new Date().toISOString().split('T')[0]
      });
      setInviteEmail('');
      setShowInviteModal(false);
      alert('Invitation sent!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your team</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Team Limit</p>
          <p className="text-xl font-bold">{teamMembers.length} / {maxMembers}</p>
        </div>
      </div>

      {!canAddTeamMember() && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p className="text-yellow-900 dark:text-yellow-200">
            Team limit reached. Upgrade to add more members.
          </p>
        </div>
      )}

      <button
        onClick={() => setShowInviteModal(true)}
        disabled={!canAddTeamMember()}
        className={`flex items-center px-4 py-2 rounded-lg font-medium ${
          canAddTeamMember() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        <UserPlus className="h-5 w-5 mr-2" />
        Invite Member
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-6 border-b last:border-0">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-4">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  {member.name}
                  {member.role === 'owner' && <Shield className="h-4 w-4 ml-2 text-purple-600" />}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                <span className="text-xs text-gray-500">Joined {member.joinedAt}</span>
              </div>
            </div>
            {member.role !== 'owner' && (
              <button
                onClick={() => removeTeamMember(member.id)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Invite Team Member</h2>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleInvite} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Send Invitation
              </button>
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
