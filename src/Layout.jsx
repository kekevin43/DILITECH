import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from './components/navigation/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import {
  ShoppingCart,
  Heart,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Laptop
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => user ? base44.entities.WishlistItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Laptop className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                TechStore
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                  <>
                    <Link to={createPageUrl('Wishlist')}>
                      <Button variant="ghost" className="relative rounded-full dark:hover:bg-gray-700">
                      <Heart className="w-5 h-5" />
                      {wishlistItems.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                          {wishlistItems.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Cart')}>
                    <Button variant="ghost" className="relative rounded-full dark:hover:bg-gray-700">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full dark:hover:bg-gray-700">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700">
                      <div className="px-2 py-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminDashboard')} className="cursor-pointer bg-purple-50 text-purple-700 font-semibold">
                              <User className="w-4 h-4 mr-2" />
                              Admin Panel
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Orders')} className="cursor-pointer">
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Wishlist')} className="cursor-pointer">
                          <Heart className="w-4 h-4 mr-2" />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => base44.auth.logout()}
                        className="cursor-pointer text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6"
                >
                  Sign In
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.role === 'admin' && (
                        <Badge className="mt-2 bg-purple-600">Admin</Badge>
                      )}
                    </div>
                    {user.role === 'admin' && (
                      <Link to={createPageUrl('AdminDashboard')} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100">
                          <User className="w-5 h-5 mr-3" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Link to={createPageUrl('Wishlist')} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Heart className="w-5 h-5 mr-3" />
                        Wishlist
                        {wishlistItems.length > 0 && (
                          <Badge className="ml-auto">{wishlistItems.length}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link to={createPageUrl('Cart')} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingCart className="w-5 h-5 mr-3" />
                        Cart
                        {cartCount > 0 && (
                          <Badge className="ml-auto">{cartCount}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link to={createPageUrl('Orders')} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Package className="w-5 h-5 mr-3" />
                        My Orders
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => base44.auth.logout()}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Laptop className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">TechStore</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Your trusted destination for premium laptops, desktops, and accessories from top brands.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl('ProductCatalog?category=laptop')} className="hover:text-white transition-colors">Laptops</Link></li>
                <li><Link to={createPageUrl('ProductCatalog?category=desktop')} className="hover:text-white transition-colors">Desktops</Link></li>
                <li><Link to={createPageUrl('ProductCatalog?category=accessory')} className="hover:text-white transition-colors">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Account</h3>
              <ul className="space-y-2">
                {user ? (
                  <>
                    <li><Link to={createPageUrl('Orders')} className="hover:text-white transition-colors">My Orders</Link></li>
                    <li><Link to={createPageUrl('Wishlist')} className="hover:text-white transition-colors">Wishlist</Link></li>
                    <li><Link to={createPageUrl('Cart')} className="hover:text-white transition-colors">Cart</Link></li>
                  </>
                ) : (
                  <li><button onClick={() => base44.auth.redirectToLogin()} className="hover:text-white transition-colors">Sign In</button></li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 TechStore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}