import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Folder, LayoutGrid, Shield, Tag, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (auth.user?.role === 'super_admin') {
        mainNavItems.push(
            {
                title: 'Tenants',
                href: '/admin/tenants',
                icon: Shield,
            },
            {
                title: 'Categories',
                href: '/admin/categories',
                icon: Tag,
            },
            {
                title: 'Courses',
                href: '/admin/courses',
                icon: BookOpen,
            },
        );
    }

    if (auth.user?.role === 'admin') {
        mainNavItems.push(
            {
                title: 'Categories',
                href: '/admin/categories',
                icon: Tag,
            },
            {
                title: 'Courses',
                href: '/admin/courses',
                icon: BookOpen,
            },
        );
    }

    if (auth.user?.role === 'teacher') {
        mainNavItems.push({
            title: 'Courses',
            href: '/teacher/courses',
            icon: BookOpen,
        });
    }

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
