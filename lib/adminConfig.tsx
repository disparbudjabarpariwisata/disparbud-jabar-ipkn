import {
    BarChart3,
    Users,
    Shield,
    Building2,
    Image,
    Search,
    Settings,
    HelpCircle,
    UserCheck,
    ClipboardList,
} from 'lucide-react';

export const ADMIN_EMAIL = 'disparbudjabarpariwisata2026@gmail.com';

export const adminMenuItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Respondents', href: '/dashboard/admin/respondents', icon: <UserCheck size={18} /> },
    { label: 'Survey Questions', href: '/dashboard/admin/questions', icon: <HelpCircle size={18} /> },
    { label: 'Result Survey', href: '/dashboard/admin/results', icon: <ClipboardList size={18} /> },
    { label: 'Role Types', href: '/dashboard/admin/role-types', icon: <Shield size={18} /> },
    { label: 'Institutions', href: '/dashboard/admin/institutions', icon: <Building2 size={18} /> },
    { label: 'Institutions Terkait', href: '/dashboard/admin/institutions-terkait', icon: <Building2 size={18} /> },
    { label: 'Cities Jabar', href: '/dashboard/admin/cities-jabar', icon: <Building2 size={18} /> },
    { label: 'Hero Slider', href: '/dashboard/admin/hero-slider', icon: <Image size={18} /> },
    { label: 'SEO General', href: '/dashboard/admin/seo', icon: <Search size={18} /> },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: <Settings size={18} /> },
];
