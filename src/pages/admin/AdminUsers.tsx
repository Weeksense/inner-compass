import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAdminAction } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MoreHorizontal, Eye, FileText, Mail, KeyRound, Ban, ShieldCheck, ShieldOff, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface EnrichedUser {
  id: string;
  email: string;
  created_at: string;
  banned_until: string | null;
  role: string;
  name: string | null;
  avatar_url: string | null;
  streak_count: number;
  total_reviews: number;
  last_review_date: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [banOpen, setBanOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const adminAction = useAdminAction();
  const perPage = 25;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAction('list_users_enriched', {
        page,
        per_page: perPage,
        search: search || undefined,
        filter: filter === 'all' ? undefined : filter,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const isBanned = (u: EnrichedUser) => u.banned_until && new Date(u.banned_until) > new Date();
  const totalPages = Math.ceil(total / perPage);

  const handleAction = async (action: string, userId: string, successMsg: string) => {
    setActionLoading(true);
    try {
      await adminAction(action, { user_id: userId });
      toast.success(successMsg);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE' || !selectedUser) return;
    setActionLoading(true);
    try {
      await adminAction('delete_user', { user_id: selectedUser.id });
      toast.success('User deleted');
      setDeleteOpen(false);
      setDeleteConfirm('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-6">Users</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-muted/50 border-border/50"
          />
        </div>
        <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] bg-muted/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden sm:table-cell">Reviews</TableHead>
                  <TableHead className="hidden lg:table-cell">Streak</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{u.name || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.total_reviews}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{u.streak_count}🔥</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {u.last_review_date ? new Date(u.last_review_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {isBanned(u) && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
                        {u.role === 'admin' && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Admin</Badge>}
                        {!isBanned(u) && u.role !== 'admin' && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedUser(u); setProfileOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction('resend_confirmation', u.id, 'Confirmation email sent')}>
                            <Mail className="w-4 h-4 mr-2" /> Resend Confirmation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('reset_password', u.id, 'Password reset email sent')}>
                            <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {isBanned(u) ? (
                            <DropdownMenuItem onClick={() => handleAction('unban_user', u.id, 'User unbanned')}>
                              <Ban className="w-4 h-4 mr-2" /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => { setSelectedUser(u); setBanOpen(true); }}>
                              <Ban className="w-4 h-4 mr-2" /> Ban User
                            </DropdownMenuItem>
                          )}
                          {u.role === 'admin' ? (
                            <DropdownMenuItem onClick={() => handleAction('remove_admin', u.id, 'Admin role removed')}>
                              <ShieldOff className="w-4 h-4 mr-2" /> Remove Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction('make_admin', u.id, 'User made admin')}>
                              <ShieldCheck className="w-4 h-4 mr-2" /> Make Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setSelectedUser(u); setDeleteOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{total} users total</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Profile slide-over */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-serif">User Profile</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {selectedUser.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-serif">
                    {selectedUser.name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-serif text-foreground">{selectedUser.name || 'No name'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'User ID', value: selectedUser.id },
                  { label: 'Role', value: selectedUser.role },
                  { label: 'Joined', value: new Date(selectedUser.created_at).toLocaleDateString() },
                  { label: 'Total Reviews', value: selectedUser.total_reviews },
                  { label: 'Current Streak', value: `${selectedUser.streak_count} weeks` },
                  { label: 'Last Review', value: selectedUser.last_review_date ? new Date(selectedUser.last_review_date).toLocaleDateString() : 'Never' },
                  { label: 'Status', value: isBanned(selectedUser) ? 'Banned' : 'Active' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Ban confirmation */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban <strong>{selectedUser?.name || selectedUser?.email}</strong>? They will see a suspension message on login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBanOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={async () => {
                if (!selectedUser) return;
                await handleAction('ban_user', selectedUser.id, 'User banned');
                setBanOpen(false);
              }}
            >
              {actionLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteConfirm(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{selectedUser?.name || selectedUser?.email}</strong> and all their data. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "DELETE"'
            className="bg-muted/50 border-border/50"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}>Cancel</Button>
            <Button variant="destructive" disabled={deleteConfirm !== 'DELETE' || actionLoading} onClick={handleDelete}>
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
