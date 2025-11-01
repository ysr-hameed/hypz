import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Introducing Hypz: Fast, Affordable Cloud Storage',
    excerpt: 'Learn about our mission to make cloud storage accessible to everyone with transparent pricing and lightning-fast performance.',
    author: 'Hypz Team',
    date: 'October 31, 2025',
    category: 'Product',
    image: '🚀'
  },
  {
    id: 2,
    title: 'How We Achieve 99.9% Uptime',
    excerpt: 'Behind the scenes look at our infrastructure, redundancy strategies, and monitoring systems that keep your data always available.',
    author: 'Engineering Team',
    date: 'October 25, 2025',
    category: 'Technical',
    image: '⚙️'
  },
  {
    id: 3,
    title: 'Security Best Practices for Cloud Storage',
    excerpt: 'Essential security tips for protecting your data in the cloud, from encryption to access controls.',
    author: 'Security Team',
    date: 'October 20, 2025',
    category: 'Security',
    image: '🔒'
  },
  {
    id: 4,
    title: 'Cost Optimization: Save Money on Cloud Storage',
    excerpt: 'Practical strategies to reduce your cloud storage costs without sacrificing performance or reliability.',
    author: 'Product Team',
    date: 'October 15, 2025',
    category: 'Guides',
    image: '💰'
  },
  {
    id: 5,
    title: 'Building Scalable Applications with Hypz',
    excerpt: 'Real-world case studies and architecture patterns for building applications that scale with Hypz.',
    author: 'Developer Relations',
    date: 'October 10, 2025',
    category: 'Tutorial',
    image: '📈'
  },
  {
    id: 6,
    title: 'API Updates: New Features and Improvements',
    excerpt: 'Discover the latest API enhancements, including new endpoints, improved performance, and developer tools.',
    author: 'API Team',
    date: 'October 5, 2025',
    category: 'Product',
    image: '🔧'
  }
];

const categories = ['All', 'Product', 'Technical', 'Security', 'Guides', 'Tutorial'];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Latest updates, guides, and insights from the Hypz team
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary-600 hover:text-primary-600 transition"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              {/* Image/Icon */}
              <div className="h-48 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center text-6xl">
                {post.image}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Read More */}
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
                  Read More
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
          <p className="mb-6 opacity-90">Get the latest updates, guides, and insights delivered to your inbox.</p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
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

export default Blog;
