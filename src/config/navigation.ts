export interface NavItem {
  title: string;
  href: string;
  icon?: string;
}

export const sidebarNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Customer',
    href: '/customers',
  },
  {
    title: 'Products',
    href: '/products',
  },
  {
    title: 'Settings',
    href: '/settings',
  },
];
