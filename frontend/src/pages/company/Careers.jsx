import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users, TrendingUp } from 'lucide-react';

const jobs = [
  {
    id: 1,
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description: 'Build scalable backend systems for our cloud storage infrastructure.'
  },
  {
    id: 2,
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create beautiful, responsive user interfaces with React and modern web technologies.'
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    department: 'Operations',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description: 'Manage and optimize our cloud infrastructure and deployment pipelines.'
  },
  {
    id: 4,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design intuitive user experiences that delight our customers.'
  },
  {
    id: 5,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Help our customers succeed and grow with Hypz.'
  }
];

const benefits = [
  { icon: '💰', title: 'Competitive Salary', description: 'Industry-leading compensation and equity' },
  { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision' },
  { icon: '🏝️', title: 'Unlimited PTO', description: 'Take time off when you need it' },
  { icon: '🏠', title: 'Remote Work', description: 'Work from anywhere in the world' },
  { icon: '📚', title: 'Learning Budget', description: '$2000/year for courses and conferences' },
  { icon: '💻', title: 'Top Equipment', description: 'Latest MacBook Pro or your choice of hardware' }
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Help us build the future of cloud storage. We're looking for talented, passionate people to join our mission.
          </p>
        </div>

        {/* Why Hypz */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Work at Hypz?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Fast Growing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Join a rapidly scaling startup</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">High Impact</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your work matters from day one</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Great Team</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Work with talented people</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Work-Life Balance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flexible and supportive culture</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Benefits & Perks
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Open Positions
          </h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition flex items-center gap-2 whitespace-nowrap">
                    Apply Now
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Don't see a position that fits?</h2>
          <p className="mb-6 opacity-90">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Get in Touch
          </Link>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Careers;
