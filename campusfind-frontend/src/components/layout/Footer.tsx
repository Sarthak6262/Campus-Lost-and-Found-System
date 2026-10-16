import React from 'react';
import { Compass, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                CAMPUSFIND
              </span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Lost Something? Find It on Campus. A secure, student-friendly platform to report, discover,
              and recover lost belongings across university grounds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Quick Links</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/items" className="hover:text-brand-600 transition">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link to="/items/report-lost" className="hover:text-brand-600 transition">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link to="/items/report-found" className="hover:text-brand-600 transition">
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-brand-600 transition">
                  Check My Claims
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Resources</h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={`${API_BASE_URL || ''}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition"
                >
                  API Documentation (Swagger)
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL || ''}/redoc`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition"
                >
                  ReDoc
                </a>
              </li>
              <li>
                <a
                  href={`${API_BASE_URL || ''}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-600 transition"
                >
                  System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} CAMPUSFIND — Campus Lost & Found Management System.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for college campuses</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
