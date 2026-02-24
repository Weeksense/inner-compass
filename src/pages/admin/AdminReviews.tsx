import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAction } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { REVIEW_QUESTIONS } from '@/lib/constants';

interface AdminReview {
  id: string;
  user_id: string;
  week_start_date: string;
  ai_summary: string;
  wins: string;
  blockers: string;
  focus_items: string[];
  energy_score: number;
  answers: Record<string, string>;
  created_at: string;
  profiles: { name: string | null; avatar_url: string | null };
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const adminAction = useAdminAction();
  const perPage = 50;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAction('list_reviews', {
        page,
        per_page: perPage,
        user_id: undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async () => {
    if (!selectedReview) return;
    setActionLoading(true);
    try {
      await adminAction('delete_review', { review_id: selectedReview.id });
      toast.success('Review deleted');
      setDeleteOpen(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-6">Reviews</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          placeholder="From"
          className="bg-muted/50 border-border/50 sm:w-40"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          placeholder="To"
          className="bg-muted/50 border-border/50 sm:w-40"
        />
      </div>

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
                  <TableHead>Week of</TableHead>
                  <TableHead className="hidden sm:table-cell">Energy</TableHead>
                  <TableHead className="hidden md:table-cell">Summary</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          {r.profiles?.avatar_url && <AvatarImage src={r.profiles.avatar_url} />}
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                            {r.profiles?.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground truncate max-w-[100px]">{r.profiles?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      ⚡ {r.energy_score}/10
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {r.ai_summary?.slice(0, 80) || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReview(r); setReviewOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelectedReview(r); setDeleteOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{total} reviews total</p>
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

      {/* Review detail slide-over */}
      <Sheet open={reviewOpen} onOpenChange={setReviewOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-serif">Review Details</SheetTitle>
          </SheetHeader>
          {selectedReview && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {selectedReview.profiles?.avatar_url && <AvatarImage src={selectedReview.profiles.avatar_url} />}
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {selectedReview.profiles?.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-medium">{selectedReview.profiles?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    Week of {new Date(selectedReview.week_start_date).toLocaleDateString()} · ⚡ {selectedReview.energy_score}/10
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Summary</h3>
                <p className="text-sm text-foreground">{selectedReview.ai_summary}</p>
              </div>

              {/* Wins & Blockers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Biggest Win</h3>
                  <p className="text-sm text-foreground">{selectedReview.wins || '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Blockers</h3>
                  <p className="text-sm text-foreground">{selectedReview.blockers || '—'}</p>
                </div>
              </div>

              {/* Focus Items */}
              {selectedReview.focus_items?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Focus Items</h3>
                  <ul className="space-y-1">
                    {selectedReview.focus_items.map((item, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Answers */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">All Answers</h3>
                <div className="space-y-4">
                  {Object.entries(selectedReview.answers || {}).map(([key, value], i) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground mb-1">
                        Q{i + 1}: {REVIEW_QUESTIONS[i] || key}
                      </p>
                      <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={actionLoading} onClick={handleDelete}>
              {actionLoading ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
