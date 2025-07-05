'use client';
import { FaHeart, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate sending feedback (in a real app, you'd send this to your backend)
    try {
      // For now, just show an alert and reset the form
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Thank you for your feedback! We appreciate your input.');
      setFeedback('');
      setEmail('');
    } catch (error) {
      alert('Sorry, there was an error sending your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EWU</span>
              </div>
              <span className="text-xl font-bold text-indigo-800">Helpdesk</span>
            </div>
            <p className="text-indigo-600 text-sm leading-relaxed">
              Your comprehensive portal for course planning, routine generation, and CGPA calculation. Built with care for EWU students.
            </p>
          </div>

          {/* Feedback Form */}
          <div className="space-y-4 w-[80%]">
            <h3 className="text-indigo-800 font-semibold text-lg">Quick Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How can we improve this portal? Share your thoughts..."
                  className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="3"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email "
                  className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <h3 className="text-indigo-800 font-semibold text-lg">Contact</h3>
            <div className="space-y-2">
              <p className="text-indigo-600 text-sm">
                Want to suggest a feature? Get in touch with the developer!
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:tashdid.professional@gmail.com"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Email Support"
                >
                  <FaEnvelope className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/ewu-helpdesk"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="GitHub Repository"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/habibur-rahman-tashdid/"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-indigo-200 mt-8 pt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0">
          <p className="text-indigo-500 text-sm">
            © {currentYear} East West University Helpdesk. Developed by <a href="https://www.tashdid.online/" target='_blank'><span className='font-semibold underline'>Hasan Habibur Rahman</span></a>
          </p>
          {/* <div className="flex space-x-6 text-xs text-indigo-500">
            <Link href="/privacy" className="hover:text-indigo-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-indigo-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-indigo-700 transition-colors">
              About
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
